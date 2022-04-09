// この関数を実行する
function main() {
  const format = 'png';
  const senarioName = 'script.txt';
  createPresentationFile(format, senarioName);
}

function createPresentationFile(format, senarioName) {
  const presentation   = SlidesApp.getActivePresentation();
  const slides         = presentation.getSlides();
  const presentationId = presentation.getId();
  const fileName       = presentation.getName();

  console.log("以下の文字列をコピーして、public.jsonに貼り付けてください。");
  console.log(`"${fileName}": {
  "name": "${fileName}",
  "page": ${slides.length},
  "script": "${senarioName}",
  "type": "${format}"
}`);

  const folderId    = DriveApp.getFileById(presentationId).getParents().next().getId();
  const folder      = DriveApp.getFolderById(folderId);
  const newFolder   = folder.createFolder(presentation.getName());
  const senario     = newFolder.createFile('script.txt', '');
 
  let pageNumber = 1;
  slides.forEach(function(slide){
    const page_id = slide.getObjectId();
    const file    = convertPresentation(presentationId, page_id, pageNumber++, format, newFolder);
    let text      = slide.getNotesPage().getSpeakerNotesShape().getText().asString();
    createSenarioText(senario, text);
 });
}

function createSenarioText(file, addText) {
  if (!addText.length){
    addText = "このページで特に言う事はありません。ゆっくり見ていってね。";
  }
  let text = file.getBlob().getDataAsString();
  let newText;
  if (!text.length){
    newText = addText;
  } else {
    newText  = text + '\n' + addText;
  }
  file.setContent(newText);
}

function convertPresentation(presentation_id, page_id, page_number, format, folder) {
  format  = format.toLowerCase();
  let ext = format;
  switch (format) {
    case "png":
    case "svg":
      break;
    case "jpg":
    case "jpeg":
    default:
      format = "jpeg";
      ext    = "jpg";
      break;
  }

  const url = "https://docs.google.com/presentation/d/" + presentation_id + "/export/" + format + "?id=" + presentation_id + "&pageid=" + page_id;
  const options = {
    method: "get",
    headers: {"Authorization": "Bearer " + ScriptApp.getOAuthToken()},
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() === 200) { 
    const presentaion = SlidesApp.openById(presentation_id);
    return folder.createFile(response.getBlob()).setName(page_number + "." + ext);
 }
}
