"use client";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";
import * as monaco from "monaco-editor";
import {
  MonacoThemeDark,
  MonacoThemeLight,
} from "@blueprintjs/monaco-editor-theme";
import { useDarkModeContext } from "../context/dark-mode-context";

function createDependencyProposals(
  range: monaco.IRange,
  monacoInstance: typeof monaco,
) {
  // returning a static list of proposals, not even looking at the prefix (filtering is done by the Monaco editor),
  // here you could do a server side lookup
  return [
    {
      label: "table_name",
      kind: monacoInstance.languages.CompletionItemKind.Field,
      documentation: "The Lodash library exported as Node.js modules.",
      insertText: "table_name",
      range: range,
    },
  ];
}

interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
}

function QueryEditor({ value, onChange }: QueryEditorProps) {
  const monacoInstance = useMonaco();
  const { darkMode, setDarkMode } = useDarkModeContext();

  useEffect(() => {
    if (!monacoInstance || !window) return;
    // const monaco = require("monaco-editor");
    const {
      setupLanguageFeatures,
      LanguageIdEnum,
    } = require("monaco-sql-languages");
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
          suggestions: createDependencyProposals(range, monacoInstance),
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
