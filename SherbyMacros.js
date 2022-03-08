const vscode = require('vscode');

/**
 * Macro configuration settings
 * { [name: string]: {              ... Name of the macro
 *    no: number,                   ... Order of the macro
 *    func: ()=> string | undefined ... Name of the body of the macro function
 *  }
 * }
 */
module.exports.macroCommands = {
   FooMacro: {
      no: 2,
      func: fooFunc
   },
   NodeAutoVersionPush: {
      no: 1,
      func: nodeAutoVersionPush
   }
};

/**
 * FooMacro as an example
 */
function fooFunc() {
   const editor = vscode.window.activeTextEditor;
   if (!editor) {
      // Return an error message if necessary.
      return 'Editor is not opening.';
   }
   const document = editor.document;
   const selection = editor.selection;
   const text = document.getText(selection);
   if (text.length > 0) {
      editor.edit(editBuilder => {
         // To surround a selected text in double quotes(Multi selection is not supported).
         editBuilder.replace(selection, `"${text}"`);
      });
   }
}


async function nodeAutoVersionPush() {
   const fs = require('fs')
   const rootPath = vscode.workspace.rootPath
   const fileName = 'package.json'
   const filePath = `${rootPath}/${fileName}`

   var exec = require('child_process').exec;
   function execute(command, callback){
      exec(command, function(error, stdout, stderr){ callback(stdout); });
   };

   execute(`git -C "${rootPath}" rev-list --all --count`, res => {
      var thisCommit = parseInt(res) ? parseInt(res)+1 : 0
      const encoding = 'utf-8'
      var text = fs.readFileSync(filePath, encoding)
      var now = new Date()
      var newVersion = `${now.getFullYear()}.${now.getMonth()+1}.${now.getDate()}-${thisCommit}`
      const regEx = new RegExp(`(?<="version":( *)")([^"]+)`, 'm')   
      var newtext = text.replace(regEx, newVersion)
      fs.writeFileSync(filePath, newtext, encoding)
      vscode.window.showInformationMessage('Build version in package.json has been updated to '+ newVersion);
      vscode.commands.executeCommand('extension.vscode-git-automator.addAndCommitAllFiles')
         .then(r =>  vscode.commands.executeCommand('extension.vscode-git-automator.pushLocalCommits'))
   })

   // Returns nothing when successful.
}