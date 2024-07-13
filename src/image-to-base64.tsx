import { Form, ActionPanel, Action, showToast, Toast, Clipboard } from "@raycast/api";
import { useState } from "react";
import fs from "fs";

export default function ImageToBase64() {
  const [filePath, setFilePath] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!filePath) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Please select an image file",
      });
      return;
    }

    try {
      const imageBuffer = fs.readFileSync(filePath);
      const base64String = imageBuffer.toString("base64");

      await Clipboard.copy(base64String);

      showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: "Base64 string copied to clipboard",
      });
      setFilePath(null);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to convert image to base64",
      });
      setFilePath(null);
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Copy Base64 to Clipboard" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.FilePicker
        id="filePath"
        title="Select Image"
        allowMultipleSelection={false}
        canChooseDirectories={false}
        onChange={(paths) => setFilePath(paths[0])}
        value={filePath ? [filePath] : []}
      />
    </Form>
  );
}
