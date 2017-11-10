<import resource="classpath:/alfresco/templates/webscripts/org/alfresco/slingshot/documentlibrary/parse-args.lib.js">

/**
 * Document List Component: treenode
 */
model.treenode = getTreeNode();

/* Create collection of folders in the given space */
function getTreeNode()
{
   try
   {
      if (url.templateArgs.site != undefined)
      {
         var siteId = url.templateArgs.site;
         var site = siteService.getSite(siteId);
         if (site && site.visibility != "PUBLIC" && !site.isMember(person.properties.userName) && !people.isAdmin(person))
         {
            status.setCode(status.STATUS_FORBIDDEN, "User is not a member of the " + siteId + " site");
            return null;
         }
      }
      var items = new Array(),
         hasSubfolders = true,
         ignoredTypes = ['fm:forum','fm:topic'],
         evalChildFolders = args["children"] !== "false",
         resultsTrimmed = false,
         argMax = parseInt(args["max"], 10),
         maxItems = isNaN(argMax) ? -1 : argMax,
         maxNumChildren = 100;

      // Use helper function to get the arguments
      var parsedArgs = ParseArgs.getParsedArgs();
      if (parsedArgs === null)
      {
         return;
      }

      // Look for folders in the pathNode - sort by ascending name
      var pagedResult = parsedArgs.pathNode.childFileFolders(false, true, ignoredTypes, 0, maxItems, 0, "cm:name", true, "TODO");

      if (pagedResult.hasMoreItems() == true)
      {
         resultsTrimmed = true;
      }

      var numChildren = 1;

      var childSubFolders;
      for each (item in pagedResult.page)
      {
      	 numChildren++;

         if (numChildren == maxNumChildren)
         {
           	evalChildFolders = false;
         }

         if (evalChildFolders)
         {
            childSubFolders = item.childFileFolders(false, true, ignoredTypes, 1);
            hasSubfolders = childSubFolders.page.length > 0;
         }


         // MMS Customization : Added title: item.properties.title? item.properties.title : "" to the JSON Object
         items.push(
         {
            node: item,
            title: item.properties.title? item.properties.title : "",
            hasSubfolders: hasSubfolders,
            aspects: item.aspectsShort
         });
      }

      return (
      {
         parent: parsedArgs.pathNode,
         resultsTrimmed: resultsTrimmed,
         items: items
      });
   }
   catch(e)
   {
      status.setCode(status.STATUS_INTERNAL_SERVER_ERROR, e.toString());
      return;
   }
}