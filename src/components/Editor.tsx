"use client";
import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import { Robot } from '../model/Game';

interface EditorProps {
  selectedRobot: Robot | null;
}

const Editor = ({ selectedRobot }: EditorProps) => {
  const [code, setCode] = useState('');

  // Update code when selected robot changes
  useEffect(() => {
    if (selectedRobot && selectedRobot.think) {
      setCode(selectedRobot.thinkCode);
    } else {
      setCode('');
    }
  }, [selectedRobot]);

  // Update robot's think function when code is saved
  const handleSave = () => {
    if (selectedRobot) {
      selectedRobot.thinkCode = code;
    }
  };

  return (
    <div>
      <AceEditor
        setOptions={{ useWorker: false }}
        mode="javascript"
        theme="monokai"
        onChange={setCode}
        value={code}
        name="editor"
        editorProps={{ $blockScrolling: true }}
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default Editor;
