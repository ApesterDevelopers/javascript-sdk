# Apester Header Tag

## Overview

**Apster Header Tag**,
Apester Header Tag is designed to add support for Apester interaction tags in web pages.

We've made the tag as lean as possible,
the flow is very simple:
We test if a media should be displayed, if it doesn't, we don't create anything.
If it does we create a loader and behind the scenes load your media content.
When the content is ready we remove the loader and send page metadata to our servers in order to supply
AWESOME Apester content for users who interact with your media.

What will you be getting from using the SDK?

* The ability to dynamicily add Apester content to you page
* Monetization ventures available only with SDK.

> "With great power comes great responsibility." - Uncle Ben

Good, Have fun!

-The Apesters

## Installation:

####  Manually

Include the JS SDK on your page once before the \</head> tag.
**The header tag needs to be loaded on each and every page, if you are generating your site content dynamicaly (using Angular's ng-view for example) contact our support for a tailor made solution support@apester.com and open a issue on github**
```html
<html>
<head>
	<title>My Site Title</title>
	
<script type="text/javascript" src="//static.apester.com/js/sdk/v2.0/apester-javascript-sdk.min.js" async></script>
</head>
<body>
	<!-- Put Editorial embedded interaction tag  -->
	<div class="apester-media" data-media-id="1234"></div>
	
	
	<!-- Put Playlist embedded interaction tag  -->
	<div class="apester-media" data-token="1234"></div>
</body>
</html>
```
Where data-token is your channel token that can be found in the Apester admin settings

* The presence of the ```async``` attribute will load Apester Javascript SDK asynchronously with the rest of the page. (the script will be executed while the page continues the parsing)
* If you prefer to load the script once the page has finished parsing you can replace the ```async``` attribute by the ```defer``` attribute. Note that however **Apester unit will take more time to load**. 

More information and list of browser support in the [W3C website](http://www.w3schools.com/tags/att_script_async.asp).


#### Using Bower

To install the latest from master branch

```
bower install --save apester-javascript-sdk
```

Or by using a specific branch

```
bower install --save apester-javascript-sdk#branch_name
```

And also with specific version tag

```
bower install --save apester-javascript-sdk#2.0.0
```


#### Compile from sources

```
npm install
gulp 
```
 
## Usage


To embed an item in your article, use the following code:

| Media Type  | HTML to embed unit  | # | tags |
|---------|--------------|--------------|------|
| Regular  |     `<interaction id="#"></interaction>`    | interaction id     |  |             
| Playlist    |   `<interaction data-token="#"></interaction> `| publisher token | |
| Contextual-Playlist    |   `<interaction data-token="#" data-context='true' ></interaction> `| publisher token | |
| Contextual-Playlist with added tags | `<interaction data-token="#" data-context="true" data-tags="tag1, tag2"></interaction>` | publisher token | tags relevant to section's context|

## Reporting Issues

Please use the [issue tracker](https://github.com/ApesterDevelopers/javascript-sdk/issues) to report issues related to Apester Javascript SDK.

## License

The MIT License

Copyright (c) 2014-2016 Apester LTD http://apester.com/

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
