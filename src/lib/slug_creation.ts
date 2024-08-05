export function createSlug (text:string){
  var textModified = text.split(" ").join("-").toLowerCase();                                                         
  textModified = textModified.replace(new RegExp('[ÁÀÂÃ]','gi'), 'a');
  textModified = textModified.replace(new RegExp('[ÉÈÊ]','gi'), 'e');
  textModified = textModified.replace(new RegExp('[ÍÌÎ]','gi'), 'i');
  textModified = textModified.replace(new RegExp('[ÓÒÔÕ]','gi'), 'o');
  textModified = textModified.replace(new RegExp('[ÚÙÛ]','gi'), 'u');
  textModified = textModified.replace(new RegExp('[Ç]','gi'), 'c');
  return textModified;    
}             
