// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "al-quickcode" is now active!');

		// 
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('al-quickcode.BuildEventSubscriber', () => {
        let headerDefReg: RegExp = /(Table|Page|Report|Codeunit|Query)\s+[0-9]+\s+(.+)/i;
		let integrationEventReg: RegExp = /^\s*[\[](IntegrationEvent)\s*[\(]\s*((true|false)\s*,\s*(true|false))\s*[\)][\]]\s*(\n|\r\n)\s*(local)\s+(procedure)\s+(\w+)[\(](\w|:|;|\s|\n|\]|\[|-|"|\.)+[\)]/im;
		const editor = vscode.window.activeTextEditor;

		const selection = editor?.document.getText(editor.selection) ?? "";

		var firstRowRange = new vscode.Range(new vscode.Position(0,0), new vscode.Position(0, 200));
		const headerRow = editor?.document.getText(firstRowRange) ?? "";			
		
		var matchObjectHeader = headerDefReg.test(headerRow);
		var matchIntegrationEvent = integrationEventReg.test(selection);

		let integrationEventDetailsReg: RegExp = /.+(\n|\r\n).+(procedure\s+)(\w+)\s*(\((\w|:|;|\s|\n|\]|\[|-|"|\.)+\))/im;
		var matchIntegrationEventElements = integrationEventDetailsReg.test(selection);

		if (matchObjectHeader && matchIntegrationEvent && matchIntegrationEventElements) {
			var headerElements = headerDefReg.exec(headerRow);
			var integrationEventElements = integrationEventDetailsReg.exec(selection);
			
			if (headerElements !== null && integrationEventElements !== null) {
				var objectType = headerElements[1].toLowerCase();
				var objectName = headerElements[2];
				var functionName = integrationEventElements[3];
				var functionParams = integrationEventElements[4];
				
				var buildObjectType = '';
				var buildUnitType = '';
				switch(objectType) {
					case 'codeunit':
						buildObjectType = 'Codeunit';
						buildUnitType = 'Codeunit';
						break;
					case 'page':
						buildObjectType = 'Page';
						buildUnitType = 'Page';
						break;
					case 'query':
						buildObjectType = 'Query';
						buildUnitType = 'Query';
						break;
					case 'report':
						buildObjectType = 'Report';
						buildUnitType = 'Report';
						break;
					case 'table':
						buildObjectType = 'Table';
						buildUnitType = 'Database';
						break;
					case 'xmlport':
						buildObjectType = 'XmlPort';
						buildUnitType = 'XmlPort';
						break;
				}

				var eventsubs = "[EventSubscriber(ObjectType::" + buildObjectType + ", " + buildUnitType +
							    "::" + objectName + ", '" + functionName + "', '', false, false)]\r\n" +
								"    local procedure " + functionName + functionParams + "\r\n" + "    begin" + 
								"\r\n    \r\n" + "    end;";

				vscode.env.clipboard.writeText(eventsubs);
			}
			vscode.window.showInformationMessage('Copied related Event Subscriber');
		}
		else {
			vscode.window.showErrorMessage('Incorrect object header or IntegrationEvent selection!');
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
