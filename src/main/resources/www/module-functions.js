
var params = $.deparam.querystring();

// Get the first item in the query string which is the name of the module to run
for(var x in params){
    var module = x;
    break;
}

// Convenience function to ensure that the module name gets prepended to all requests. Also adds a timestamp to ensure file is reloaded
function url(url){

    var baseUrl = "/";

    if(module){
        baseUrl += module + "/";
    }

    return baseUrl + url + "?timestamp=" + new Date().getTime();
}

//Load and parse the demo.details file to find any required external resources
$.get(url("demo.details"), function(response){

    try{

        // Trim the leading dashes and trailing ellipses
        var inputLines = response.split("\n");
        var outputLines = [];
        var includeSubsequentLines = false;
        for(var x in inputLines){
            if(includeSubsequentLines){
                // Stop parsing once we find '...'
                if(inputLines[x].trim() === '...'){
                    break;
                }
                // Include this line in the output
                outputLines.push(inputLines[x]);
                // Only start parsing once we've found '---'
            } else if(inputLines[x].trim() === '---'){
                includeSubsequentLines = true;
            }
        }

        // Build the output string
        var outputStr = outputLines.join("\n");

        // Parse the output string
        var details = jsyaml.safeLoad(outputStr);

        // Iterate over the resources array (if if exists) and include anything found
        if(details.resources){
            for(var x in details.resources){
                var resource = details.resources[x];
                var ext = resource.substring(resource.lastIndexOf('.') + 1);
                // Check if js
                if(ext == 'js'){
                    $.getScript(details.resources[x]);
                } else if (ext == 'css'){
                    // Check if css
                    $('<link/>', {rel: 'stylesheet', href: resource}).appendTo('head');
                } else {
                    alert("Unsupported extension: " + ext + "\n" + resource);
                }
            }
        }

        // Load the html file into the main window
        $.get(url('demo.html'), function(response){

            // Load the HTML content
            $('#main-content').html(response);
            // Attach the javascript file
            $.getScript(url('demo.js'));
            // Attach the css file
            $('<link/>', {rel: 'stylesheet', href: url('demo.css')}).appendTo('head');

        }, 'text');

    } catch (e){
        alert(e);
    }
}, "text");

function detectModuleChanges(){

    detectChanges(function(data){

        // Check whether we care about the file(s) that were affected
        for(var x in data.affected_files){
            var filename = data.affected_files[x];
            // We only need to refresh the module page if the changes relate to that folder
            if(filename == module || filename.substring(module.length + 1) == module + "\\" || filename.substring(module.length + 1) == module + "/"){
                console.log("reload");
                window.location.reload();
            }
        }
    });
}

detectModuleChanges();