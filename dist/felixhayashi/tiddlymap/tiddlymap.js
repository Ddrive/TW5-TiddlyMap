/*\

title: $:/plugins/felixhayashi/tiddlymap/tiddlymap.js
type: application/javascript
module-type: widget

@preserve

\*/
(function(){"use strict";var e=require("$:/core/modules/widgets/widget.js").widget;var t=require("$:/core/modules/widgets/dropzone.js").dropzone;var i=require("$:/plugins/felixhayashi/tiddlymap/view_abstraction.js").ViewAbstraction;var r=require("$:/plugins/felixhayashi/tiddlymap/callback_registry.js").CallbackRegistry;var s=require("$:/plugins/felixhayashi/tiddlymap/dialog_manager.js").DialogManager;var o=require("$:/plugins/felixhayashi/tiddlymap/utils.js").utils;var a=require("$:/plugins/felixhayashi/vis/vis.js");var n=function(e,t){this.initialise(e,t);this.adapter=$tw.tiddlymap.adapter;this.opt=$tw.tiddlymap.opt;this.notify=$tw.tiddlymap.notify;this.callbackRegistry=new r;this.dialogManager=new s(this,this.callbackRegistry);this.computeAttributes();this.editorMode=this.getAttribute("editor");if(this.editorMode){this.addEventListeners([{type:"tm-create-view",handler:this.handleCreateView},{type:"tm-rename-view",handler:this.handleRenameView},{type:"tm-delete-view",handler:this.handleDeleteView},{type:"tm-edit-view",handler:this.handleEditView},{type:"tm-store-position",handler:this.handleStorePositions},{type:"tm-edit-node-filter",handler:this.handleEditNodeFilter},{type:"tm-import-tiddlers",handler:this.handleImportTiddlers}])}};n.prototype=new e;n.prototype.handleConnectionEvent=function(e,t){var i=this.getView().getAllEdgesFilterExpr(true);var r={edgeFilterExpr:i,fromLabel:this.adapter.selectNodeById(e.from).label,toLabel:this.adapter.selectNodeById(e.to).label};this.dialogManager.open("getEdgeType",r,function(i,r){if(i){var s=o.getText(r);e.label=s&&s!==this.opt.misc.unknownEdgeLabel?s:this.opt.misc.unknownEdgeLabel;this.adapter.insertEdge(e,this.getView())}if(typeof t=="function"){t(i)}})};n.prototype.openStandardConfirmDialog=function(e,t){var i={message:t,dialog:{confirmButtonLabel:"Yes, proceed",cancelButtonLabel:"Cancel"}};this.dialogManager.open("getConfirmation",i,e)};n.prototype.logger=function(e,t){var i=Array.prototype.slice.call(arguments,1);i.unshift("@"+this.objectId.toUpperCase());i.unshift(e);$tw.tiddlymap.logger.apply(this,i)};n.prototype.render=function(e,t){this.registerParentDomNode(e);this.storyRiver=document.getElementsByClassName("tc-story-river")[0];this.sidebar=document.getElementsByClassName("tc-sidebar-scrollable")[0];this.objectId=this.getAttribute("object-id")?this.getAttribute("object-id"):o.genUUID();this.viewHolderRef=this.getViewHolderRef();this.view=this.getView();this.initAndRenderEditorBar(e);this.initAndRenderGraph(e);$tw.tiddlymap.registry.push(this)};n.prototype.registerParentDomNode=function(e){this.parentDomNode=e;if(!$tw.utils.hasClass(e,"tiddlymap")){$tw.utils.addClass(e,"tiddlymap");if(this.getAttribute("click-to-use")!=="false"){$tw.utils.addClass(e,"click-to-use")}if(this.getAttribute("editor")==="advanced"){$tw.utils.addClass(e,"advanced-editor")}if(this.getAttribute("class")){$tw.utils.addClass(e,this.getAttribute("class"))}}};n.prototype.initAndRenderEditorBar=function(e){if(this.editorMode==="advanced"){this.graphBarDomNode=document.createElement("div");$tw.utils.addClass(this.graphBarDomNode,"filterbar");e.appendChild(this.graphBarDomNode);this.rebuildEditorBar();this.renderChildren(this.graphBarDomNode)}};n.prototype.rebuildEditorBar=function(){if(this.editorMode==="advanced"){this.setVariable("var.viewLabel",this.getView().getLabel());this.setVariable("var.isViewBound",String(this.isViewBound()));this.setVariable("var.ref.view",this.getView().getRoot());this.setVariable("var.ref.viewHolder",this.getViewHolderRef());this.setVariable("var.ref.edgeFilter",this.getView().getPaths().edgeFilter);this.setVariable("var.edgeFilterExpr",this.view.getAllEdgesFilterExpr());var e={type:"tiddler",attributes:{tiddler:{type:"string",value:this.getView().getRoot()}},children:[{type:"transclude",attributes:{tiddler:{type:"string",value:this.opt.ref.graphBar}}}]};this.makeChildWidgets([e])}};n.prototype.refresh=function(e){this.callbackRegistry.handleChanges(e);var t=this.isViewSwitched(e);var i=this.getView().refresh(e);if(t||i.length){var r={resetData:true,resetOptions:true,resetFocus:true};if(t){this.logger("warn","View switched");this.view=this.getView(true)}else{this.logger("warn","View modified",i);r.resetData=false}this.rebuildGraph(r)}else{this.checkOnGraph(e)}if(this.editorMode){this.checkOnEditorBar(e,t,i)}};n.prototype.rebuildGraph=function(e){this.logger("debug","Rebuilding graph");if(!e)e={};this.hasNetworkStabilized=false;if(e.resetData){this.graphData.edges.clear();this.graphData.nodes.clear();this.graphData.edgesById=null;this.graphData.nodesById=null;this.graphData.nodesByRef=null}if(e.resetOptions){this.graphOptions=this.getGraphOptions();this.network.setOptions(this.graphOptions)}this.graphData=this.getGraphData(true);if(e.resetFocus&&!this.preventNextContextReset){if(typeof e.resetFocus!=="object"){e.resetFocus={delay:0,duration:0}}this.fitGraph(e.resetFocus.delay,e.resetFocus.duration);this.doZoomAfterStabilize=true;this.preventNextContextReset=false}};n.prototype.getContainer=function(){return this.parentDomNode};n.prototype.getGraphData=function(e){if(!e&&this.graphData){return this.graphData}var t=this.getView().getNodeFilter("compiled");console.log("nodeFilter",this.getView().getNodeFilter("expression"));var i=this.adapter.selectNodesByFilter(t,{view:this.getView(),outputType:"hashmap",addProperties:{group:"matches"}});if(this.getView().getLabel()==="quick_connect"){var r=this.adapter.selectNodesByReference([this.getVariable("currentTiddler")],{outputType:"hashmap",addProperties:{group:"special",x:1,y:1}});o.inject(r,i)}var s=this.adapter.selectEdgesByEndpoints(i,{view:this.getView(),outputType:"hashmap",endpointsInSet:">=1"});if(this.getView().isConfEnabled("display_neighbours")){var a=this.adapter.selectNeighbours(i,{edges:s,outputType:"hashmap",view:this.getView(),addProperties:{group:"neighbours"}});o.inject(a,i)}if(this.getView().getConfig("layout.active")==="hierarchical"){this.setHierarchy(i,s,this.getView().getHierarchyEdgeTypes())}if(!this.graphData)this.graphData=o.getEmptyMap();this.graphData.nodes=o.refresh(i,this.graphData.nodesById,this.graphData.nodes);this.graphData.edges=o.refresh(s,this.graphData.edgesById,this.graphData.edges);this.graphData.nodesByRef=o.getLookupTable(i,"ref");this.graphData.nodesById=i;this.graphData.edgesById=s;return this.graphData};n.prototype.setHierarchy=function(e,t,i){function r(s,o){if(s.level)return;s.level=o;for(var a in t){var n=t[a];if(n.from===s.id){var d=e[n.to];if(i[n.label]){r(d,o+1)}else{r(d,o)}}else if(n.to===s.id){var h=e[n.from];if(i[n.label]){r(h,o-1)}else{r(h,o)}}}}e:for(var s in e){for(var o in t){if(e[s].level||e[s].id===t[o].to){continue e}}r(e[s],1e3)}};n.prototype.isViewBound=function(){return o.startsWith(this.getViewHolderRef(),this.opt.path.localHolders)};n.prototype.isViewSwitched=function(e){if(this.isViewBound()){return false}else{return o.hasOwnProp(e,this.getViewHolderRef())}};n.prototype.checkOnEditorBar=function(e,t,i){if(t||i.length){this.removeChildDomNodes();this.rebuildEditorBar();this.renderChildren(this.graphBarDomNode);return true}else{return this.refreshChildren(e)}};n.prototype.checkOnGraph=function(e){var t=this.getView().getNodeFilter("compiled");var i=o.getMatches(t,Object.keys(e));if(i.length){this.logger("info","Modified nodes",i);this.rebuildGraph();return}else{for(var r in e){if(this.graphData.nodesByRef[r]){this.logger("info","Obsolete node",i);this.rebuildGraph();return}}}var s=this.getView().getEdgeFilter("compiled");var a=o.getMatches(s,Object.keys(e));if(a.length){this.logger("info","Changed edge stores",a);this.rebuildGraph();return}};n.prototype.initAndRenderGraph=function(e){this.logger("info","Initializing and rendering the graph");if(this.editorMode){var i=this.makeChildWidget({type:"dropzone"});console.log(i);var r=this;i.handleDropEvent=function(e){r.lastImportDropCoordinates={x:e.clientX,y:e.clientY};t.prototype.handleDropEvent.call(this,e)};i.render(e);this.graphDomNode=i.findFirstDomNode()}else{this.graphDomNode=document.createElement("div");e.appendChild(this.graphDomNode)}$tw.utils.addClass(this.graphDomNode,"vis-graph");e.style["width"]=this.getAttribute("width","100%");window.addEventListener("resize",this.handleResizeEvent.bind(this),false);window.addEventListener("click",this.handleClickEvent.bind(this),false);window.addEventListener(o.getFullScreenApis()["_fullscreenChange"],this.handleFullScreenChange.bind(this),false);this.handleResizeEvent();this.graphOptions=this.getGraphOptions();this.graphData=this.getGraphData();this.network=new a.Network(this.graphDomNode,this.graphData,this.graphOptions);this.callbackRegistry.add("$:/state/sidebar",this.repaintGraph.bind(this),false);var s=this.getAttribute("refresh-trigger");if(o.tiddlerExists(s)){this.callbackRegistry.add(s,this.handleTriggeredRefresh.bind(this),false)}this.network.on("doubleClick",this.handleDoubleClickEvent.bind(this));this.network.on("stabilized",this.handleStabilizedEvent.bind(this));this.network.on("dragStart",this.handleNodeDragStart.bind(this));this.network.on("dragEnd",this.handleNodeDragEnd.bind(this));this.addGraphButtons({fullscreen:this.handleToggleFullscreen});this.setGraphButtonEnabled("fullscreen",true)};n.prototype.getGraphOptions=function(){if(!this.graphOptions){var e=$tw.utils.extendDeepCopy(this.opt.user.vis);e.onDelete=function(e,t){this.handleRemoveElement(e)}.bind(this);e.onConnect=function(e,t){this.handleConnectionEvent(e)}.bind(this);e.onAdd=function(e,t){this.handleInsertNode(e)}.bind(this);e.onEditEdge=function(e,t){var i=this.handleReconnectEdge(e)}.bind(this);e.dataManipulation={enabled:this.editorMode?true:false,initiallyVisible:true};e.navigation=true;e.clickToUse=this.getAttribute("click-to-use")!=="false"}else{var e=this.graphOptions}if(this.getView().getConfig("layout.active")==="hierarchical"){e.hierarchicalLayout.enabled=true;e.hierarchicalLayout.layout="direction"}else{e.hierarchicalLayout.enabled=false}return e};n.prototype.handleCreateView=function(){this.dialogManager.open("getViewName",null,function(e,t){if(e){var i=this.adapter.createView(o.getText(t));this.setView(i.getRoot())}})};n.prototype.handleTriggeredRefresh=function(e){this.logger("log","Tiddler",e,"triggered a refresh");this.rebuildGraph({resetData:false,resetOptions:false,resetFocus:{delay:1e3,duration:1e3}})};n.prototype.handleRenameView=function(){if(this.getView().getLabel()==="default"){this.notify("Thou shalt not rename the default view!");return}this.dialogManager.open("getViewName",null,function(e,t){if(e){this.view.rename(o.getText(t));this.setView(this.view.getRoot())}})};n.prototype.handleEditView=function(){var e={"var.edgeFilterExpr":this.getView().getEdgeFilter("expression"),dialog:{preselects:this.getView().getConfig()}};this.dialogManager.open("editView",e,function(e,t){if(e&&t){var i=o.getPropertiesByPrefix(t.fields,"config.");this.getView().setConfig(i)}})};n.prototype.handleDeleteView=function(){var e=this.getView().getLabel();if(e==="default"){this.notify("Thou shalt not kill the default view!");return}var t="[regexp:text[<\\$tiddlymap.*?view=."+e+"..*?>]]";var i=o.getMatches(t);if(i.length){var r={count:i.length.toString(),filter:t};this.dialogManager.open("cannotDeleteViewDialog",r,null);return}var s="You are about to delete the view "+"''"+e+"'' (no tiddler currently references this view).";this.openStandardConfirmDialog(function(t){if(t){this.getView().destroy();this.setView(this.opt.path.views+"/default");this.notify('view "'+e+'" deleted ')}},s)};n.prototype.handleReconnectEdge=function(e){var t=this.graphData.edges.get(e.id);$tw.utils.extend(t,e);this.adapter.deleteEdgesFromStore([{id:t.id,label:t.label}],this.getView());return this.adapter.insertEdge(t,this.getView())};n.prototype.handleRemoveElement=function(e){if(e.edges.length&&!e.nodes.length){this.adapter.deleteEdgesFromStore(this.graphData.edges.get(e.edges),this.getView());this.notify("edge"+(e.edges.length>1?"s":"")+" removed")}if(e.nodes.length){this.handleRemoveNode(this.graphData.nodesById[e.nodes[0]])}};n.prototype.handleToggleFullscreen=function(){this.logger("log","Toggle fullscreen");if(!this.isFullscreenMode){this.logger("log","Adding fullscreen markers");var e=this.opt.misc.cssPrefix+"fullscreen";var t=this.opt.misc.cssPrefix+"has-fullscreen-child";var i=document.getElementsByClassName(e)[0];$tw.utils.addClass(this.parentDomNode,e);var r=document.getElementsByClassName("tc-story-river")[0];if(this.storyRiver&&this.storyRiver.contains(this.parentDomNode)){$tw.utils.addClass(this.storyRiver,t)}else{if(this.sidebar&&this.sidebar.contains(this.parentDomNode)){$tw.utils.addClass(this.sidebar,t)}}this.isFullscreenMode=true}this.dispatchEvent({type:"tm-full-screen"})};n.prototype.handleRemoveNode=function(e){var t={"var.nodeLabel":e.label,"var.nodeRef":e.ref,dialog:{preselects:{"opt.delete":"from system"}}};this.dialogManager.open("deleteNodeDialog",t,function(t,i){if(t){if(i.fields["opt.delete"]==="from system"){this.adapter.deleteNodesFromStore([e])}else{var r=this.getView().removeNodeFromFilter(e);if(!r){this.notify("Couldn't remove node from filter");return}}this.notify("Node removed "+i.fields["opt.delete"])}})};n.prototype.handleFullScreenChange=function(){if(this.isFullscreenMode&&!document[o.getFullScreenApis()["_fullscreenElement"]]){this.logger("log","Removing fullscreen markers");var e=this.opt.misc.cssPrefix+"fullscreen";var t=this.opt.misc.cssPrefix+"has-fullscreen-child";o.findAndRemoveClassNames([e,t]);this.isFullscreenMode=false}};n.prototype.handleImportTiddlers=function(e){var t=JSON.parse(e.param);var i=this.graphDomNode.getBoundingClientRect();var r=this.network.DOMtoCanvas({x:this.lastImportDropCoordinates.x-i.left,y:this.lastImportDropCoordinates.y-i.top});for(var s=0;s<t.length;s++){var a=this.wiki.getTiddler(t[s].title);if(!a){this.notify("Cannot integrate foreign tiddler");return}if(o.isMatch(a,this.getView().getNodeFilter("compiled"))){this.notify("Node already exists");continue}var n=this.adapter.createNode(a,{x:s*20+r.x,y:r.y},this.getView());if(n){this.getView().addNodeToView(n);this.rebuildGraph()}}};n.prototype.handleStorePositions=function(e){this.adapter.storePositions(this.network.getPositions(),this.getView());if(e){this.notify("positions stored")}};n.prototype.handleEditNodeFilter=function(){var e={prettyFilter:this.getView().getPrettyNodeFilterExpr()};this.dialogManager.open("editNodeFilter",e,function(t,i){if(t){this.getView().setNodeFilter(o.getText(i,e.prettyFilter))}})};n.prototype.handleStabilizedEvent=function(e){if(!this.hasNetworkStabilized){this.hasNetworkStabilized=true;this.logger("log","Network stabilized after "+e.iterations+" iterations");this.setNodesMoveable(this.graphData.nodesById,this.getView().isConfEnabled("physics_mode"));if(this.doZoomAfterStabilize){this.doZoomAfterStabilize=false;this.fitGraph(1e3,1e3)}}};n.prototype.fitGraph=function(e,t){window.clearTimeout(this.activeZoomExtentTimeout);var i=function(){this.network.zoomExtent({duration:t});this.activeZoomExtentTimeout=0}.bind(this);if(e){this.activeZoomExtentTimeout=window.setTimeout(i,e)}else{i()}};n.prototype.handleStartStabilizionEvent=function(e){};n.prototype.setNodesMoveable=function(e,t){this.network.storePositions();var i=[];var r=Object.keys(e);for(var s=0;s<r.length;s++){var o={id:e[r[s]].id,allowedToMoveX:t,allowedToMoveY:t};i.push(o)}this.graphData.nodes.update(i)};n.prototype.handleInsertNode=function(e){this.dialogManager.open("getNodeName",null,function(t,i){if(t){e.label=o.getText(i);this.adapter.insertNode(e,{view:this.getView(),editNodeOnCreate:false});this.preventNextContextReset=true}})};n.prototype.handleDoubleClickEvent=function(e){if(!e.nodes.length&&!e.edges.length){if(this.editorMode){this.handleInsertNode(e.pointer.canvas)}}else{if(this.isFullscreenMode){this.handleToggleFullscreen()}if(e.nodes.length){var t=this.graphData.nodes.get(e.nodes[0]);this.logger("debug","Doubleclicked on node",t);this.lastNodeDoubleClicked=t;var i=t.ref}else if(e.edges.length){this.logger("debug","Doubleclicked on an Edge");var r=this.graphData.edges.get(e.edges[0]);var s=r.label?r.label:this.opt.misc.unknownEdgeLabel;var i=this.getView().getEdgeStoreLocation()+"/"+s}this.dispatchEvent({type:"tm-navigate",navigateTo:i})}};n.prototype.handleResizeEvent=function(e){if(this.sidebar.contains(this.parentDomNode)){var t=window.innerHeight;var i=this.parentDomNode.getBoundingClientRect().top;var r=this.getAttribute("bottom-spacing","10px");var s=t-i+"px";this.parentDomNode.style["height"]="calc("+s+" - "+r+")"}else{var o=this.getAttribute("height");this.parentDomNode.style["height"]=o?o:"300px"}if(this.network){this.repaintGraph()}};n.prototype.destruct=function(){window.removeEventListener("resize",this.handleResizeEvent);this.network.destroy()};n.prototype.handleClickEvent=function(e){if(!document.body.contains(this.parentDomNode)){window.removeEventListener("click",this.handleClickEvent);return}if(this.network){var t=document.elementFromPoint(e.clientX,e.clientY);if(!this.parentDomNode.contains(t)){this.network.selectNodes([])}}};n.prototype.handleNodeDragEnd=function(e){if(e.nodeIds.length&&this.getView().getConfig("layout.active")!=="hierarchical"){var t=this.getView().isConfEnabled("physics_mode");var i=this.graphData.nodesById[e.nodeIds[0]];this.setNodesMoveable([i],t);if(!t){this.handleStorePositions()}}};n.prototype.handleNodeDragStart=function(e){if(e.nodeIds.length){var t=this.graphData.nodesById[e.nodeIds[0]];this.setNodesMoveable([t],true)}};n.prototype.getViewHolderRef=function(){if(this.viewHolderRef){return this.viewHolderRef}this.logger("info","Retrieving or generating the view holder reference");var e=this.getAttribute("view");if(e){this.logger("log",'User wants to bind view "'+e+'" to graph');var t=this.opt.path.views+"/"+e;if(this.wiki.getTiddler(t)){var i=this.opt.path.localHolders+"/"+o.genUUID();this.logger("log",'Created an independent temporary view holder "'+i+'"');this.wiki.addTiddler(new $tw.Tiddler({title:i,text:t}));this.logger("log",'View "'+t+'" inserted into independend holder')}else{this.logger("log",'View "'+e+'" does not exist')}}if(typeof i==="undefined"){this.logger("log","Using default (global) view holder");var i=this.opt.ref.defaultGraphViewHolder}return i};n.prototype.setView=function(e,t){if(e){if(!t){t=this.viewHolderRef}this.logger("info",'Inserting view "'+e+'" into holder "'+t+'"');this.wiki.addTiddler(new $tw.Tiddler({title:t,text:e}))}this.view=this.getView(true)};n.prototype.getView=function(e){if(!e&&this.view){return this.view}var t=this.getViewHolderRef();var r=this.wiki.getTiddler(t).fields.text;this.logger("info",'Retrieved view "'+r+'" from holder "'+t+'"');if(o.tiddlerExists(r)){return new i(r)}else{this.logger("log",'Warning: View "'+r+"\" doesn't exist. Default is used instead.");return new i("default")}};n.prototype.repaintGraph=function(){if(!document[o.getFullScreenApis()["_fullscreenElement"]]||this.isFullscreenMode){this.logger("info","Repainting the whole graph");this.network.redraw();this.network.zoomExtent()}};n.prototype.setGraphButtonEnabled=function(e,t){var i="network-navigation tiddlymap-button "+e;var r=this.parentDomNode.getElementsByClassName(i)[0];$tw.utils.toggleClass(r,"enabled",t)};n.prototype.addGraphButtons=function(e){var t=this.parentDomNode.getElementsByClassName("vis network-frame")[0];for(var i in e){var r=document.createElement("div");r.className="network-navigation tiddlymap-button "+i;r.addEventListener("click",e[i].bind(this),false);t.appendChild(r)}};exports.tiddlymap=n})();