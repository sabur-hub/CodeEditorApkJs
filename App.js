import React, { useRef, useState } from 'react';
import { Button, StyleSheet, View, Text } from 'react-native';
import WebView from 'react-native-webview';

const CodeEditor = () => {
    const webViewRef = useRef(null);

    const [messages, setMessages] = useState([]);

    const onMessage = (event) => {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.command === 'consoleLog') {
            setMessages((prevMessages) => [...prevMessages, data.data].slice(-5));
            console.log('WebView console.log:', data.data);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>IT Run</Text>
                <Text style={styles.headerText1}>JavaScript editor</Text>
            </View>
            <View style={styles.messagesContainer}>
                <Text style={styles.consoleEditorHeader}>Output</Text>
                {messages.map((message, index) => (
                    <Text key={index} style={styles.messageText}>
                        {message}
                    </Text>
                ))}
            </View>
            <Button
                color="orange"
                onPress={() => {
                    setMessages([]);
                }}
                title="Clear Console"
            />
            <WebView
                ref={webViewRef}
                source={{
                    html: `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Monaco Editor</title>
                <script src="https://unpkg.com/monaco-editor@0.27.0/min/vs/loader.js"></script>
                <style>
                  body, html, #editor {
                    background-color: black;
                    margin: 0;
                    padding-top: 0;
                    height: 90vh;
                    width: 100%;
                  }
                  #undoButton, #redoButton{
                    background-color: orange    ;
                    color: #ffffff;
                    border: none;
                    border-radius: 4px;
                    font-size: 25px;
                    font-weight: bold;
                    cursor: pointer;
                    outline: none;
                    margin-top: 5px;
                    margin-left: 5px;
                    height: 4vh;
                    margin-bottom: 10px;
                  }
                  #executeButton{
                    right: 10px;
                    background-color: #000000;
                    color: red;
                    border: none;
                    border-radius: 4px;
                    font-size: 20px;
                    font-weight: bold;
                    cursor: pointer;
                    outline: none;
                    margin-top: 10px;
                    margin-left: 10px;
                    height: 4vh;
                    margin-bottom: 10px;
                  }
                   #openCurlyBracket, #lessThan,#greaterThan, #closeSquareBracket, #closeCurlyBracket,#openSquareBracket, #singleQuote, #doubleQuote,#closeParenthesis, #openParenthesis{
                    background-color: orange;
                    color: black;
                    border: none;
                    border-radius: 4px;
                    font-size: 15px;
                    cursor: pointer;
                    outline: none;
                    margin-left: 12px;
                    height: 5vh;
                    margin-bottom: 10px;
                  }
                  .buttonsDiv {
                    display: flex;
                    justify-content: start;
                    align-items: end;
                    width: 100%;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background-color: #000000;
                    padding: 10px;
                  }
                  .undoRedoDiv{
                    background-color: #000000;
                    display:flex;
                    justify-content: center;
                    align-items: end;
                    width:18%;
                    border-radius:1px
                  }
                  .icon {
                    display: inline-block;
                    vertical-align: middle;
                    width: 14px;
                    height: 14px;
                    margin-right: 4px;
                  }
                </style>
              </head>
              <body>
                <div id="editor"></div>
                <div class="buttonsDiv">
                  <div class="undoRedoDiv">
                    <div><button id="undoButton">⤹</button></div>
                    <div><button id="redoButton">⤸</button></div>
                  </div>
                  <!-- Ваши кнопки -->
                  <div><button id="openCurlyBracket">{</button></div>
                  <div><button id="closeCurlyBracket">}</button></div>
                  <div><button id="singleQuote">'</button></div>
                  <div><button id="doubleQuote">"</button></div>
                  <div><button id="openParenthesis">(</button></div>
                  <div><button id="closeParenthesis">)</button></div>
                  <div><button id="openSquareBracket">[</button></div>
                  <div><button id="closeSquareBracket">]</button></div>
                  <div><button id="lessThan"><</button></div>
                  <div><button id="greaterThan">></button></div>
                  <div><button id="executeButton">▶️</button></div>
                </div>
                <script>
                  require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@0.27.0/min/vs' }});
                  require(['vs/editor/editor.main'], function() {
                      monaco.editor.defineTheme('vs-dark', {
                            base: 'vs-dark',
                            inherit: true,
                            rules: [],
                            colors: {
                                'editor.background': '#000000',
                                'editor.foreground': '#FFFFFF',
                                // Другие настройки цветов по вашему выбору
                            }
                        });
                    window.editor = monaco.editor.create(document.getElementById('editor'), {
                      value: [
                        ' ',
                        'function helloWorld() {',
                        '  console.log("Hello, IT RUN!");',
                        '}',
                        ' ',
                        'helloWorld();'
                      ].join('\\n'),
                      language: 'javascript',
                      theme: 'vs-dark'
                    });

                    const originalConsoleLog = console.log;
                    console.log = function() {
                      const args = Array.from(arguments).map(arg => JSON.stringify(arg));
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        command: 'consoleLog',
                        data: args.join(' ')
                      }));
                      originalConsoleLog.apply(console, arguments);
                    };

                    function insertText(text) {
                      const position = window.editor.getPosition();
                      const range = new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column);
                      const id = { major: 1, minor: 1 };
                      const textModel = window.editor.getModel();
                      const op = { identifier: id, range, text, forceMoveMarkers: true };
                      textModel.pushEditOperations([], [op], () => null);
                      window.editor.focus();
                    }

                    document.getElementById('redoButton').addEventListener('click', function() {
                      window.editor.trigger('', 'redo', '');
                    });
                    document.getElementById('undoButton').addEventListener('click', function() {
                      window.editor.trigger('', 'undo', '');
                    });
                    document.getElementById('openCurlyBracket').addEventListener('click', function() {
                      insertText('{');
                    });
                    document.getElementById('closeCurlyBracket').addEventListener('click', function() {
                      insertText('}');
                    });
                    document.getElementById('singleQuote').addEventListener('click', function() {
                      insertText("'");
                    });
                    document.getElementById('doubleQuote').addEventListener('click', function() {
                      insertText('"');
                    });
                    document.getElementById('openParenthesis').addEventListener('click', function() {
                      insertText('(');
                    });
                    document.getElementById('closeParenthesis').addEventListener('click', function() {
                      insertText(')');
                    });
                    document.getElementById('openSquareBracket').addEventListener('click', function() {
                      insertText('[');
                    });
                    document.getElementById('closeSquareBracket').addEventListener('click', function() {
                      insertText(']');
                    });
                    document.getElementById('lessThan').addEventListener('click', function() {
                      insertText('<');
                    });
                    document.getElementById('greaterThan').addEventListener('click', function() {
                      insertText('>');
                    });

                    document.getElementById('executeButton').addEventListener('click', function() {
                      const code = window.editor.getValue();
                      try {
                        const script = new Function(code);
                        script();
                      } catch (error) {
                        console.error(error);
                      }
                    });
                  });
                </script>
              </body>
            </html>
          `,
                }}
                onMessage={onMessage}
                style={styles.webview}
                useWebKit={true}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000000',
        paddingTop: 10,
        flex: 1,
    },
    webview: {
        flex: 1,
        height: '60%',
    },
    buttonContainer: {
        backgroundColor: '#000000',
        // padding: 10,
        width: '100%', // Add this line to make the button container the same width as the editor
    },
    messagesContainer: {
        height: '30%',
        padding: 10,
        backgroundColor: 'black',
        overflowY: 'auto',
    },
    messageText: {
        fontSize: 14,
        fontFamily: 'monospace',
        marginBottom: 10,
        color: 'orange',
    },
    consoleEditorHeader: {
        color: 'orange',
        fontWeight: 'bold',
        marginBottom: 15,
    },
    header: {
        backgroundColor: '#000000',
        paddingVertical: 10,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'orange',
    },
    headerText1: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'orange',
    },
});

export default CodeEditor;
