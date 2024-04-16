"use client";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";
import * as monaco from "monaco-editor";
import {
  MonacoThemeDark,
  MonacoThemeLight,
} from "@blueprintjs/monaco-editor-theme";
import { useDarkModeContext } from "../context/dark-mode-context";
import { LanguageIdEnum, setupLanguageFeatures } from "monaco-sql-languages";
import { useSelectedDatabase } from "@/stores";
import { useDatabaseSchemas } from "@/data/use-database";
import _ from "lodash";
import { ExternalColumn } from "@/definitions";

interface SuggestionProps {
  label: string;
  kind: monaco.languages.CompletionItemKind;
  documentation?: string;
  insertText: string;
  range: monaco.IRange;
}

function createDependencyProposals(
  range: monaco.IRange,
  monacoInstance: typeof monaco,
  schemas?: Record<string, Record<string, Record<string, ExternalColumn>>>,
) {
  // returning a static list of proposals, not even looking at the prefix (filtering is done by the Monaco editor),
  // here you could do a server side lookup
  const suggestions: SuggestionProps[] = [];
  const tables = new Set<string>();
  const columns = new Set<string>();

  _.keys(schemas).forEach((schema: string) => {
    if (!schemas) return;

    _.keys(schemas[schema]).forEach((table) => {
      _.keys(schemas[schema][table]).forEach((column) => {
        columns.add(column);
      });

      tables.add(table);
    });

    suggestions.push({
      label: schema,
      kind: monacoInstance.languages.CompletionItemKind.Module,
      documentation: "Schema name",
      insertText: schema,
      range: range,
    });
  });

  tables.forEach((table) => {
    suggestions.push({
      label: table,
      kind: monacoInstance.languages.CompletionItemKind.Field,
      documentation: "Table name",
      insertText: table,
      range: range,
    });
  });

  columns.forEach((column) => {
    suggestions.push({
      label: column,
      kind: monacoInstance.languages.CompletionItemKind.Variable,
      documentation: "Column name",
      insertText: column,
      range: range,
    });
  });

  return suggestions;
}

interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
}

function QueryEditor({ value, onChange }: QueryEditorProps) {
  const monacoInstance = useMonaco();
  const { darkMode, setDarkMode } = useDarkModeContext();
  const [selectedDatabase, setSelectedDatabase] = useSelectedDatabase();
  const {
    data: schemas,
    isLoading: isLoadingSchemas,
    error: schemasError,
  } = useDatabaseSchemas(selectedDatabase?.id);

  useEffect(() => {
    if (!monacoInstance || !window) return;
    // const monaco = require("monaco-editor");
    // const require("monaco-sql-languages/out/esm/pgsql/pgsql.ts");
    // console.log(typeof setupLanguageFeatures);
    // monacoInstance.languages.setLanguageConfiguration("pgsql", conf);
    setupLanguageFeatures({
      languageId: LanguageIdEnum.PG,
      completionItems: true,
    });
    monacoInstance?.languages.registerCompletionItemProvider("pgsql", {
      provideCompletionItems: function (model, position) {
        // find out if we are completing a property in the 'dependencies' object.
        var word = model.getWordUntilPosition(position);
        var range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        return {
          suggestions: createDependencyProposals(
            range,
            monacoInstance,
            schemas,
          ),
        };
      },
    });

    monacoInstance.editor.defineTheme("vs-dark", { ...MonacoThemeDark });
    monacoInstance.editor.defineTheme("vs-light", { ...MonacoThemeLight });
    monacoInstance.editor.setTheme(darkMode ? "vs-dark" : "vs-light");

    monacoInstance.editor.addCommand({
      id: "run-query",
      run: () => {},
    });
    monacoInstance.editor.addEditorAction({
      id: "run-query",
      label: "Run Query",
      contextMenuGroupId: "test",
      keybindings: [
        monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
      ],
      run: () => {},
    });
  }, [monacoInstance, darkMode]);

  return (
    <div className="h-full overflow-hidden rounded-md ">
      <Editor
        value={value}
        onChange={onChange}
        height="100%"
        defaultLanguage="pgsql"
        defaultValue="// some comment"
        options={{ minimap: { enabled: false } }}
      />
    </div>
  );
}

export default QueryEditor;
