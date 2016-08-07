# Apester Javascript SDK

## Overview

**Apster SDK Script**,
Apester SDK script is designed to add support for Apester interaction tags in web pages.

We've made the SDK script as lean as possible,
the flow is very simple:
We test if a media should be displayed, if it doesn't, we don't create anything.
If it does we create a loader and behind the scenes load your media content.
When the content is ready we remove the loader and send page metadata to our servers in order to supply
AWESOME content recommendation for users who interact with your media.

What will you be getting from using the SDK?

* Define new html tag <interaction>
* More stable, scaleable and faster experience.
* Dynamic embed features and embed­resize.
* New build for the content recommendation engine ­ fast, smarter and based on user sentiment.
* Monetization ventures available only with SDK.

> "With great power comes great responsibility." - Uncle Ben

Good, Have fun!

-The Apester R&D Team

## Installation:

1.  Manually

Include the JS SDK on your page once before the \</head> tag.

```html
<html>
<head>
	<title>My Site Title</title>
	
<script type="text/javascript" src="//static.apester.com/js/sdk/v1.1/apester-sdk.min.js" async></script>
</head>
<body>
	<!-- Put your embedded interaction tag  -->
	<interaction id="1234"></interaction>
</body>
</html>
```

* The presence of the ```async``` attribute will load Apester Javascript SDK asynchronously with the rest of the page. (the script will be executed while the page continues the parsing)
* If you prefer to load the script once the page has finished parsing you can replace the ```async``` attribute by the ```defer``` attribute. Note that however **Apester unit will take more time to load**. 

More information and list of browser support in the [W3C website](http://www.w3schools.com/tags/att_script_async.asp).



 
## Usage


To embed an item in your article, use the following code:

| Media Type  | HTML to embed unit  | # | 
|---------|--------------|--------------|
| Regular  |     `<interaction id="#"></interaction>`    | interaction id     |               
| Playlist    |   `<interaction data-random="#"></interaction> `| publisher token |    

## Reporting Issues

Please use the [issue tracker](https://github.com/ApesterDevelopers/javascript-sdk/issues) to report issues related to Apester Javascript SDK.