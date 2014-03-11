/*
 * TextNodeTraverser - uses a TreeWalker to find all dom Text nodes and associate them with their nested parents
 * 
 * - root, dom node to search
 */
function TextNodeTraverser(root, debug) {
	this.root = root;
    this.tw = document.createTreeWalker(this.root, NodeFilter.SHOW_TEXT);
    this.list = []
    this.chunks = []
    this.cumcount = [];
    this.dbug = debug || false;
    
    // with each text node, build a reference:
    // - list[], array with node stats and node references
    // - chunks, array with numbers indicating length of text in list node at corresponding index
    // - cumcount, array with cumulative length of text nodes in order of list & chunk indices
    
	while(this.tw.nextNode()) {
		var node = this.tw.currentNode,
			text = node.wholeText,
			ancestor = this.getAncestor(node),
			pad = 0;
			
		if(!text.trim())
			continue;
			
		if(this.list.length && this.list[this.list.length-1].ancestor!=ancestor)
			pad = 1;
			
		this.chunks.push(text.length + pad);
		
		this.list.push({
			ancestor: ancestor,
			parent:	node.parentNode,
			text:	text,
			length:	text.length + pad,
			node:	node
		});
	}
    
	this.chunks.forEach(function(chunk) {
		var last = this.cumcount[this.cumcount.length-1] || 0;
		this.cumcount.push(chunk + last);
	}.bind(this));
}

/*
 * getAncestor - grabs nearest ancestor to the root element
 * 
 * - node, dom node to grab parent element for (up to but excluding the root)
 */
TextNodeTraverser.prototype.getAncestor = function(node) {
    var ancestor = node.parentNode;
    if(ancestor==this.root)
        return node;
    else
        return this.getAncestor(ancestor);
};

/*
 * addNodeAt - inserts node between text nodes at index corresponding to character position in root textContent
 * 
 * - node, dom node to insert
 * - index, number corresponding to character position for insertion
 * 
 * TODO: rather than have this submethod, the traverser should always grab the most recent text nodes
 *       and parse to normalize for markdown in order to achieve accurate cursor positioning.
 *       Need to determine how to adjust for paragraph breaks ("jump" parent nodes).
 * 
 *       Look into updating text node text with img tag vs adding as node.
 */
TextNodeTraverser.prototype.addNodeAt = function(node, index) {
    
    if(!this.list || !this.list.length)
        return this.root.appendChild(node);
    
    var block
      , offset = 0
      , last = this.cumcount[this.cumcount.length-1];
    
    // if the index indicates it's the last node, go straight to appending node
    
    if(last <= index) {
        var lastNode = this.list[this.list.length-1].node;
        lastNode.parentNode.insertBefore(node, lastNode.nextSibling);
    }
    
    // otherwise, split the text node and insert node between parts
    
    else {
        
        // iterate to determine the text node we're targeting for splitting
        
        for(i=0; i<this.cumcount.length; i++) {

            block = i;

            if(this.cumcount[i]>index)
                break;

            offset = this.cumcount[i];
        }
        
        this.list[block].parent.normalize();
        
        var targetNode = this.list[block].node
          , pos = index - offset
          , childNodes = Array.prototype.slice.call(this.list[block].parent.childNodes,0)
          , childText = childNodes.filter(function(child) { return child.nodeType===3; })
          , childLengths = childText.map(function(child) { return child.length; });
        
        // if the targetnode is only one character, insert after that
        
        if(this.dbug) {
            console.log('inserting at index', index, 'with offset', offset);
        
            console.log('before', childNodes.map(function(child) {
                if(child.nodeType === 3)
                    return child.data + '=' + (targetNode === child);
                else if(child.nodeType === 1)
                    return 'element';
            }), childLengths);
        }
        
        try {
            var splitNode = targetNode.length==1
                            ? ( index == 0 && childNodes.indexOf(targetNode)==0 ? targetNode : targetNode.nextSibling )
                            : targetNode.splitText(pos);

            if(this.dbug) {

                console.log(targetNode.length==1 ? 'insertBefore' : 'splitting');

                childNodes = Array.prototype.slice.call(this.list[block].parent.childNodes,0);
                childText = childNodes.filter(function(child) { return child.nodeType===3; });
                childLengths = childText.map(function(child) { return child.length; });

            }

            targetNode.parentNode.insertBefore(node, splitNode);

            if(this.dbug)
                console.log('after', childNodes.map(function(child) {
                    if(child.nodeType === 3)
                        return child.data + '=' + (splitNode === child);
                    else if(child.nodeType === 1)
                        return 'element';
                }), childLengths);
        }
        catch(e) {
            console.warn('Traverser Issue:', e);
        }
    }
    
};

module.exports = TextNodeTraverser;