import { ExternalColumn } from "@/definitions";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { blueprintIcons } from "./blueprint/icons";
import { OpenAI } from "openai";
import * as assert from "assert";
import * as _ from "lodash";

@Injectable()
export class LlmsService {
  constructor(private readonly configService: ConfigService) {}

  async callLlmAllTables(
    openAI: OpenAI,
    availableIcons: string[],
    usedColors: string[],
    parsedTables,
    errorMessages: string[],
  ) {
    let prompt = `You will be given information about multiple tables in a database.
    Your only job is to generate three things about each table:
      - An icon that represents the table
      - A color that represents the table (in hex format)
      - A description of the table
      
    The format of your response should be a JSON array with the following keys:
    [
      {
        name: "tableName",
        icon: "iconName",
        color: "#hexColor",
        description: "Table description"
      }
    ]
    
    The "name" key should be the name of the table given in the prompt.

    The list of available icons that you can choose from is as follows:

    ${JSON.stringify(availableIcons)}

    You MUST choose one of the above icons for each table — do not return anything in the "icon" field that is not one of the above options.

    You can choose the hex color that you think should be associated with the table.
    The list of colors that have already been used is as follows:
    
    ${usedColors.join(", ")}

    Do not choose a color that has already been used.

    Additionally, each icon and color chosen should be unique from one another; do not duplicate icons or colors.
    
    The description of the table should be a brief summary of the table's purpose and contents.
    
    The tables that you're generating information for are listed below, with the associated columns.
    Use the table names and columns to generate appropriate icons, colors, and descriptions.

    ${JSON.stringify(parsedTables)}`;

    if (errorMessages.length > 0) {
      prompt += `\n
      The following error messages were encountered during previous attempts:
      
      ${errorMessages.join("\n\n")}

      Do not make these errors again.`;
    }

    return await openAI.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-3.5-turbo",
    });
  }

  async callLlmOneTable(
    openAI: OpenAI,
    availableIcons: string[],
    triedIcons: string[],
    parsedTable,
  ) {
    const prompt = `You will be given information about a single table in a database.
    Your only job is to generate the string name of an icon that represents the table.
    The list of available icons that you can choose from is as follows:

    ${JSON.stringify(availableIcons)}

    You MUST choose one of the above icons for the table — do not return anything that is not one of the above options.

    The table that you are generating information for is listed below, with the associated columns.

    ${JSON.stringify(parsedTable)}

    You have already tried the following — do not return any of these:

    ${triedIcons.join(", ")}`;

    const completion = await openAI.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    return completion.choices[0].message.content;
  }

  async generateTablesMetadata(
    tables: Record<string, ExternalColumn[]>,
    usedColors: string[],
    usedIcons: string[],
  ) {
    const openAIKey = this.configService.get("openaiApiKey");

    // If there is no openAI key, return default metadata
    if (!openAIKey) {
      return _.map(_.keys(tables), (tableName) => {
        return {
          name: tableName,
          icon: "cube",
          color: "gray",
          description: "",
        };
      });
    }

    const openAI = new OpenAI({ apiKey: openAIKey });
    const availableIcons = _.map(
      _.filter(blueprintIcons, (icon) => {
        return !_.includes(usedIcons, icon.iconName);
      }),
      (icon) => icon.iconName,
    );

    const parsedTables = _.map(tables, (tableColumns, tableName) => {
      const columns = _.pick(tableColumns, ["name", "type"]);
      return {
        tableName,
        columns,
      };
    });

    // Use LLM to try generating metadata three times — set to defaults if failure
    let metadata;
    let index = 0;
    const errorMessages: string[] = [];
    while (!metadata && index < 3) {
      const completion = await this.callLlmAllTables(
        openAI,
        availableIcons,
        usedColors,
        parsedTables,
        errorMessages,
      );
      assert(
        completion.choices[0].message.content,
        "No content returned from OpenAI",
      );

      try {
        metadata = JSON.parse(completion.choices[0].message.content);
      } catch (e) {
        errorMessages.push(e.message);
        index += 1;
      }
    }

    if (!metadata) {
      metadata = _.map(parsedTables, (table) => {
        return {
          name: table.tableName,
          icon: "cube",
          color: "gray",
          description: "",
        };
      });
    }

    // Ensure that each icon exists and regenerate via LLM if not
    const tableIcons = await Promise.all(
      _.map(metadata, async (table) => {
        let icon = table.icon;
        let index = 0;
        const attemptedIcons: string[] = [];
        while (!_.includes(availableIcons, icon) && index < 3) {
          attemptedIcons.push(icon);
          icon = await this.callLlmOneTable(
            openAI,
            availableIcons,
            attemptedIcons,
            _.find(
              parsedTables,
              (parsedTable) => parsedTable.tableName === table.name,
            ),
          );
          index += 1;
        }

        if (!_.includes(availableIcons, table.icon)) {
          icon = "cube";
        }

        return {
          icon: icon,
          name: table.name,
        };
      }),
    );

    // Set the generated icons for each table
    metadata = _.map(metadata, (table) => {
      return {
        ...table,
        icon:
          _.find(tableIcons, (tableIcon) => table.name === tableIcon.name)
            ?.icon || "cube",
      };
    });

    return metadata;
  }
}
