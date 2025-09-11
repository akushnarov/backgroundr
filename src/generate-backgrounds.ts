/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Config } from './config';
import { getFileById } from './drive-api';
import { queryGemini as queryNanoBanano } from './nano-banano';
import { OnePrompt } from './one-prompt';
export function generateOnePromptImages() {
  const config = Config.readConfig();
  console.log({ config });
  if (!('Images input sheet' in config)) {
    throw new Error("Please specify 'Images input sheet' in Config sheet.");
  }

  const IMAGE_SHEET = SpreadsheetApp?.getActiveSpreadsheet()?.getSheetByName(
    config['Images input sheet'] as string
  );

  if (!IMAGE_SHEET) {
    throw new Error(`Sheet not found: "${config['Images input sheet']}".`);
  }

  if (!('One Prompt Number of variants' in config)) {
    throw new Error(
      "Please specify 'One Prompt Number of variants' in Config sheet."
    );
  }

  if (
    !('Dropdowns sheet' in config) ||
    !('One Prompt prefix' in config) ||
    !config['Dropdowns sheet'] ||
    !config['Dropdowns sheet'].length ||
    !config['One Prompt prefix'] ||
    !config['One Prompt prefix'].length
  ) {
    throw new Error(
      "Please specify 'Dropdowns sheet' and 'One Prompt prefix' in Config sheet."
    );
  }

  const backgroundDefinitions = new Array(
    parseInt(config['One Prompt Number of variants'])
  ).fill(
    OnePrompt.generatePrompt(
      config['Dropdowns sheet'],
      config['One Prompt prefix']
    )
  );
  console.log({ backgroundDefinitions });

  const HEADER_ROWS = 1;
  IMAGE_SHEET.getRange('B:B')
    .offset(HEADER_ROWS, 0)
    .getValues()
    .forEach(([id], currentIndex) => {
      if (!id) {
        return;
      }
      const file = getFileById(id);
      const fileBlob = file.getBlob();
      const mimeType = file.getMimeType();
      const bytes = fileBlob.getBytes();
      const base64Data = Utilities.base64Encode(bytes);
      try {
        const variations = backgroundDefinitions.map((e, bgIndex) => {
          const currentImage = IMAGE_SHEET.getRange(
            currentIndex + 1 + HEADER_ROWS,
            5 + bgIndex,
            1,
            1
          ).getValue();
          if (currentImage !== '') {
            return null;
          }

          const resultImageBase64 = queryNanoBanano(e, base64Data, mimeType);
          return SpreadsheetApp.newCellImage()
            .setSourceUrl(`data:image/png;base64,${resultImageBase64}`)
            .build();
        });
        variations.forEach((img, i) => {
          if (img) {
            IMAGE_SHEET.getRange(
              currentIndex + 1 + HEADER_ROWS,
              5 + i
            ).setValue(img);
          }
        });
        for (let i = 3; i < 5 + backgroundDefinitions.length; i++) {
          IMAGE_SHEET.setColumnWidth(i, 256);
        }
      } catch (e) {
        IMAGE_SHEET.getRange(currentIndex + 1, 1, 1, 1)
          .offset(HEADER_ROWS, 4)
          .setValue(`Error: ${e}`);
      }
    });
}
