/*
 * getCaret - get current cursor location
 * 
 * - el, dom node
 */
function getCaret(el) { 
  if (el.selectionStart) { 
    return el.selectionStart; 
  } else if (document.selection) { 
    el.focus(); 

    var r = document.selection.createRange(); 
    if (r == null) { 
      return 0; 
    } 

    var re = el.createTextRange(), 
        rc = re.duplicate(); 
    re.moveToBookmark(r.getBookmark()); 
    rc.setEndPoint('EndToStart', re); 

    return rc.text.length; 
  }  
  return 0; 
}

/*
 * getText - get raw text from node, minus markup
 * 
 * - node
 */
function getText(el) {
    return el.innerText || el.textContent;
}

/*
 * insertNodeAfterSelection
 * 
 * - node, dom node to be inserted after selected range
 */
function insertNodeAfterSelection(node) {
    var sel, range, html;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.collapse(false);
            range.insertNode(node);
            sel.removeAllRanges();
        }
        
    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        range.collapse(false);
        html = (node.nodeType == 3) ? node.data : node.outerHTML;
        range.pasteHTML(html);
        document.selection.empty();
    }
}


/*
 * makeSelection - sets current selection
 * 
 * - el, dom node with text to select
 * - start, number for starting position
 * - end, number for ending position
 */
function makeSelection(el, start, end) {
    if (window.getSelection && document.createRange) {
        var sel = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(el);
        range.setStart(el, start);
        range.setEnd(el, end || start);
        sel.removeAllRanges();
        sel.addRange(range);
        
        // TODO: need to find equivalent edit for old browsers:
        
    } else if (document.selection && document.body.createTextRange) {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.select();
    }
}

/*
 * translatePosition - gets plain text equivalent cursor position by offsetting for markdown markup
 * 
 * - md, string of markdown text
 * - pos, number indicating current position
 */
function translatePosition(md, pos) {
    var mdToPos = md.substr(0, pos);
    if(!pos || !mdToPos)    return pos;
    
    // count "invisible" markdown markup
    var markup = mdToPos.match(/#/g) || [];
    
    return pos - markup.length;
}

module.exports = {
    getCaret:                   getCaret,
    getText:                    getText,
    insertNodeAfterSelection:   insertNodeAfterSelection,
    makeSelection:              makeSelection,
    translatePosition:          translatePosition
};