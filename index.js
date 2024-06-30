const Enquirer = require('enquirer');
const PathPrompt = require("./prompts/PathPrompt");
const enquirer = new Enquirer();

enquirer.register('path', PathPrompt)

enquirer.prompt({
	type: 'path',
	name: 'workingDir',
	message: 'Select working dir',
	initialDirectory: 'Z:/'
}).then(console.log)