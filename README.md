# OpenRCT2 Fix Vandalism With Staff

An OpenRCT2 plug-in that enables you to fix vandalized path additions with selected staff when they walk passed it. Ideal for when you want more convenience than manually replacing vandalized additions but don't want to disable vandalism completely.

## Acknowledgements

[The OpenRCT2 team is planning on adding a similar feature for handymen themselves in the future](https://github.com/OpenRCT2/OpenRCT2/wiki/Features-to-implement). This plug-in is meant as a shallow band-aid solution until an official feature comes by.

## Features
- Enable or disable plug-in functionality within the plug-in itself
- Vandalized path additions are automatically fixed for a repair cost when selected staff types walk by
- Select which staff types can do the fixing (to get the most out of them or finally make them more useful (looking at you security guard))
- Variable repair cost (if you think fixing should be cheaper than replacing or to give yourself a punishment for letting guests become angry in the first place)

![Plug-in preview](https://i.imgur.com/Fk9empk.gif) ![Plug-in window](https://i.imgur.com/AgIVexH.png)

## Installation

1. Download the latest version of the plugin from the [Releases page](https://github.com/WesselAmmerlaan/OpenRCT2-FixVandalismWithStaff/releases).
2. To install it, put the downloaded `*.js` file into your `/OpenRCT2/plugin` folder.
    - Easiest way to find the OpenRCT2-folder is by launching the OpenRCT2 game, click and hold on the red toolbox in the main menu, and select "Open custom content folder".
    - Otherwise this folder is commonly found in `C:/Users/<YOUR NAME>/Documents/OpenRCT2/plugin` on Windows.
    - If you already had this plugin installed before, you can safely overwrite the old file.
3. Once the file is there, it should show up ingame in the dropdown menu under the map icon.

## Usage

The plug-in will start working automatically. To open the manager window, click on "Fix vandalization with staff" in the map menu in the upper toolbar of OpenRCT2. There you can adjust the plug-in to your liking or disable the plug-in's functionality.

For testing the plug-in I recommend using the [map-tool.js from the plug-in samples](https://github.com/OpenRCT2/plugin-samples) to vandalize your whole park with a few clicks.

## Further notes

I tested the plug-in with 200 staff in a regularly sized and filled park with multi-threading enabled using a Ryzen 5 2600X CPU (my standard configuration) and it did not hinder gameplay at all. I cannot guarantee that it doesn't hinder performance in larger and more filled parks or less powerful machines (as it scales linearly with the number of staff and elements per tile on which the staff walks). 

I didn't use a plug-in template, because I didn't expected the file to get this large when I began working on it!

I'm not very involved in the OpenRCT2 community, so share this plug-in where you think it needs sharing (other than the plug-in website).

Have fun!

