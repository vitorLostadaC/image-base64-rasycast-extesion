import { Form, ActionPanel, Action, showToast, Detail, Toast, Icon } from "@raycast/api";
import { useState } from "react";
import fs from "fs";
import path from "path";
import os from "os";
import { isValidBase64 } from "./libs/base64";
import { getImageDimensionsFromBase64 } from "./libs/imageUtils";

type Values = {
  base64: string;
};

interface Image {
  image: string;
  extension: string;
  size: {
    width: number;
    height: number;
  };
}

export default function Base64ToImage() {
  const [image, setImage] = useState<Image | null>(null);

  function handleSubmit({ base64 }: Values) {
    if (!base64) {
      showToast({
        title: "Error",
        message: "Please enter a base64 string",
        style: Toast.Style.Failure,
      });
      return;
    }

    const cleanedBase64 = base64.replaceAll('"', "").split(",").pop() || "";
    if (!isValidBase64(cleanedBase64)) {
      showToast({
        title: "Error",
        message: "Invalid base64 string. Please check your input.",
        style: Toast.Style.Failure,
      });
      return;
    }

    let imageData: string;
    let extension: string;

    if (!base64.startsWith("data:image/")) {
      imageData = `data:image/png;base64,${base64}`;
      extension = "png";
    } else {
      imageData = base64.replaceAll('"', "");
      extension = base64.split(",")[0].split("/")[1];
    }

    setImage({
      image: imageData,
      extension: extension,
      size: getImageDimensionsFromBase64(base64) ?? { width: 0, height: 0 },
    });
  }

  function handleDownload() {
    if (!image) return;

    const downloadsPath = path.join(os.homedir(), "Downloads");
    const fileName = `image_${Date.now()}.png`;
    const filePath = path.join(downloadsPath, fileName);

    const base64Data = image.image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        showToast({
          title: "Error",
          message: "Failed to download image",
          style: Toast.Style.Failure,
        });
      } else {
        showToast({
          title: "Success",
          message: `Image downloaded to ${filePath}`,
          style: Toast.Style.Success,
        });
      }
    });
  }

  if (image) {
    return (
      <Detail
        markdown={`![Converted Image](${image.image})`}
        actions={
          <ActionPanel>
            <ActionPanel.Section>
              <Action
                title="Convert Another"
                onAction={() => setImage(null)}
                icon={Icon.ArrowClockwise}
                shortcut={{ modifiers: ["cmd"], key: "r" }}
              />
              <Action
                title="Download Image"
                onAction={handleDownload}
                icon={Icon.Download}
                shortcut={{ modifiers: ["cmd"], key: "d" }}
              />
            </ActionPanel.Section>
            <ActionPanel.Section>
              <Action.CopyToClipboard
                title="Copy Image"
                content={image.image}
                shortcut={{ modifiers: ["cmd"], key: "c" }}
              />
            </ActionPanel.Section>
          </ActionPanel>
        }
        metadata={
          <Detail.Metadata>
            <Detail.Metadata.Label title="Format" text={image.extension.toUpperCase()} />
            <Detail.Metadata.Separator />
            <Detail.Metadata.Label title="Size" text={`${image.size.width}x${image.size.height}`} />
            <Detail.Metadata.Separator />
            <Detail.Metadata.TagList title="Actions">
              <Detail.Metadata.TagList.Item text="Download" color={"#007AFF"} />
              <Detail.Metadata.TagList.Item text="Copy" color={"#32D74B"} />
            </Detail.Metadata.TagList>
          </Detail.Metadata>
        }
      />
    );
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea id="base64" title="Base 64" placeholder="Paste your base64 image here" />
    </Form>
  );
}
