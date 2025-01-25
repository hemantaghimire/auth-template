import { program } from "commander";
import { execa } from "execa";

program
  .name("sandip-express")
  .description("A CLI for creating express project")
  .version("1.0.0")
  .argument("<project-name>", "Name of the project")
  .action((projectName) => {
    console.log("Project Name: ", projectName);
  });

program.parse(process.argv);

const options = program.opts();

if (options.debug) console.log(options);
