/** @jsx React.DOM */

var React = require('react/addons')
  , Showdown = require('showdown/src/showdown')
  , cx = React.addons.classSet
  , TextNodeTraverser = require('./libs/traverser')
  , Utils = require('./libs/utils');

require('./css/style.less');

module.exports = React.createClass({
    
    displayName: 'Wysimdown',
    
    getInitialState: function() {
        return {
            content: ''
        };
    },
    
    getDefaultProps: function() {
        return {};
    },
    
    componentWillMount: function() {
        this.converter = new Showdown.converter();
        this.cursor = document.createElement('img');
        this.cursor.className = 'wysimdown-cursor';
    },
    
    componentDidMount: function() {},
    
    /*
     * editorOnFocus - STEP 1, editor gets focus and passes to textarea
     */
    editorOnFocus: function() {

        var selection = window.getSelection()  // TODO: needs to support IE 8, document.selection ?
        
          , textNode = this.refs.rendered.getDOMNode()
          , renderedText = Utils.getText(textNode)
          , textarea = this.refs.textarea.getDOMNode();
        
        if(selection.isCollapsed)
        {
            // if no content and selection represents cursor, focus textarea
            this.updateEditor();
        }
    },
    
    /*
     * updateEditor - STEP 2, textarea gets focus and updates editor caret / cursor position
     */
    updateEditor: function() {
        var cursorEl = this.refs.renderedCursor.getDOMNode()
          , rendered = this.refs.rendered.getDOMNode()
          , plainText = Utils.getText(rendered)
          , textarea = this.refs.textarea.getDOMNode()
          , pos = textarea.selectionStart;
        
        var actualPosition = Utils.translatePosition(textarea.value, pos); // TODO: does not generate proper offset (textnode split error)
        
        var traverser = new TextNodeTraverser(cursorEl);
        traverser.addNodeAt(this.cursor, actualPosition);
        
        textarea.focus();
    },
    
    /*
     * onEditorChange - STEP 3, content has changed, render markdown and update positions (back to STEP 2)
     */
    onEditorChange: function(ev) {
        
        if(this.updateTimeout)
            clearTimeout(this.updateTimeout);
        
        var textarea = this.refs.textarea.getDOMNode()
          , loc = textarea.selectionStart
          , text = textarea.value || '';
        
        if(ev.which==13)
            text = textarea.value = text.substr(0, loc) + "\n" + text.substr(loc);
        
        this.setState({ content: this.converter.makeHtml(text) }, function() {
            this.updateEditor();
        });
    },
    
    render: function() {
        
        var renderClass = {
            'wysimdown-textarea':  true
        };
        
        renderClass = cx(renderClass);
        
        return (
            <div className="wysimdown">
                <textarea ref="textarea" className="show" onKeyUp={this.onEditorChange}></textarea>
                <div className="wysimdown-container">
                    <div ref="renderedCursor" className="wysimdown-cursorarea" dangerouslySetInnerHTML={{ __html: this.state.content }} />
                    <div ref="rendered" className={renderClass} onMouseUp={this.editorOnFocus} dangerouslySetInnerHTML={{ __html: this.state.content }} />
                </div>
            </div>
        );
    }
    
});