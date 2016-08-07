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

Include the JS SDK on your page once before the \</head> tag.
`<script type="text/javascript" src="//static.apester.com/js/sdk/v1.1/apester-sdk.min.js"></script>`
 
## Usage


To embed an item in your article, use the following code:

| Media Type  | HTML to embed unit  | # | 
|---------|--------------|--------------|
| Regular  |     `<interaction id="#"></interaction>`    | interaction id     |               
| Playlist    |   `<interaction data-random="#"></interaction> `| publisher token |    
