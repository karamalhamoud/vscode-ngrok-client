import * as vscode from "vscode";
import * as request from "request";
import * as ngrok from "ngrok";
import * as open from "open";

import constants from "./constants";

let output: any;
let statusBarIcon: vscode.StatusBarItem;

const createLog = (msg: string) => {
  if (msg) {
    output.appendLine(`ngrok-client: ${msg}`);
  }
};

const stopServer = () => {
  return new Promise(resolve => {
    request(constants.tunnelApi, { json: true }, (err, res, body) => {
      if (!err && body.tunnels) {
        body.tunnels.forEach((tunnel: any) => {
          ngrok.disconnect(tunnel.public_url);
        });

        createLog("Remote server closed.");
      }

      resolve("");
    });
  });
};

const updateStatusBarItem = () => {
  if (statusBarIcon.text === constants.statusBarStopText) {
    vscode.commands.executeCommand(constants.commands.startServer);
  } else {
    vscode.commands.executeCommand(constants.commands.stopServer);
  }
};

const createStatusBarItem = () => {
  statusBarIcon = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, Number.MAX_SAFE_INTEGER);
  statusBarIcon.command = constants.commands.toggle;
  statusBarIcon.text = `$(globe) start ngrok server`;
  statusBarIcon.show();
};

export function activate(context: vscode.ExtensionContext) {
  output = vscode.window.createOutputChannel("ngrok-client");

  createStatusBarItem();

  context.subscriptions.push(
    vscode.commands.registerCommand(constants.commands.startServer, () => {
      output.show();
      stopServer().then(() => {
        const path = vscode.workspace.rootPath;
        if (path) {

          try {
            var localhost = path.substr(path.lastIndexOf('\\') + 1);
            createLog(`local web server: http://localhost/${localhost}`);
            createLog(`Creating remote http server via ngrok...`);

            ngrok.connect({
              proto: 'http',
              addr: 'http://localhost/',
            })
              .then(result => {
                createLog(`ngrok started successfully: Remote URL: ${result}/${localhost}`);

                (async () => {
                  await open(result + "/" + localhost);
                })();

                statusBarIcon.text = constants.statusBarStartText;
              })
              .catch(error => {
                if (error && error.error_code && error.error_code === 103) {
                }
                createLog(`An Error Occured. Error Detail: ${JSON.stringify(error)}`);
              });
          } catch (error) {
            createLog(`An Error Occured. Error Detail: ${JSON.stringify(error)}`);
          }
        } else {
          vscode.window.showWarningMessage("You must open a folder to use ngrok-client.", {
            modal: true
          });
        }
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(constants.commands.stopServer, function () {
      output.show();
      stopServer().then(() => {
        statusBarIcon.text = constants.statusBarStopText;
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(constants.commands.toggle, function () {
      updateStatusBarItem();
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {
  vscode.commands.executeCommand(constants.commands.stopServer);

}
