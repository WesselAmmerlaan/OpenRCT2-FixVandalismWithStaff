// Global variables
var staffFixesVandalismSubscription = null; // Holds the subscription if the plugin is enabled
var tickCounter = 0; // Used to only check for vandalism every n ticks

// --- Main functions ---
var main = function() {
    if (network.mode !== "client") {
        ui.registerMenuItem("Fix vandalism with staff", function () {
            showWindow();
        });

        subscribeToStaffFixesVandalism(config.getPluginEnabled());
    }
};

function showWindow() {
    // Builds the plugin manager window

    const window = ui.getWindow('staff_fix_vandalism_management');
    if (window) {
        window.bringToFront();
        return;
    }
  
    const windowDesc = {
      classification: 'staff_fix_vandalism_management',
      width: 210,
      height: 140,
      title: 'Fix Vandalism With Staff Manager',
      widgets: [
        makeCheckboxWidget (
            20,
            210,
            "Have selected staff fix vandalized path additions in your park when walking past it for a fixed cost",
            "Fix vandalism using selected staff",
            config.getPluginEnabled(),
            function(isChecked){subscribeToStaffFixesVandalism(isChecked);}
        ),

        makeCheckboxWidget(
            45,
            100,
            "Have handymen fix vandalized path additions, because that's most logical by definition", 
            "Handymen", 
            config.getHandymenFixVandalism(), 
            function(isChecked){config.setHandymenFixVandalism(isChecked);}
        ),

        makeCheckboxWidget(
            60,
            100,
            "Have mechanics fix vandalized path additions, because they're the ones that do the fixing",
            "Mechanics", 
            config.getMechanicsFixVandalism(), 
            function(isChecked){config.setMechanicsFixVandalism(isChecked);}
        ),

        makeCheckboxWidget(
            75,
            100,
            "Have guards fix vandalized path additions, because they didn't do their job well enough or make them useful for once", 
            "Security Guards", 
            config.getGuardsFixVandalism(), 
            function(isChecked){config.setGuardsFixVandalism(isChecked);}
        ),

        makeCheckboxWidget(
            90,
            100,
            "Have entertainers fix vandalized path additions, because why not?", 
            "Entertainers", 
            config.getEntertainersFixVandalism(), 
            function(isChecked){config.setEntertainersFixVandalism(isChecked);}
        ),
        
        {
            type: 'label',
            x: 5,
            y: 115,
            width: 210,
            height: 10,
            tooltip: 'Change how much you think a repair should cost. A repair cost of 100% is as much as manually replacing the item yourself.',
            text: "Repair costs",
            onChange: function() {},
        },

        {
            type: 'dropdown',
            x: 75,
            y: 115,
            width: 100,
            height: 13,
            items: repairCostOptions.map(function(v){return v.s}),
            selectedIndex: repairCostOptions.map(function(v){return v.n}).indexOf(config.getRepairCostFactor()),
            onChange: function(index) {config.setRepairCostFactor(repairCostOptions[index].n);}
        },
      ],
    };
    ui.openWindow(windowDesc);
}

function makeCheckboxWidget(y, width, tooltip, text, isChecked, onChange) {
    return {
      type: 'checkbox',
      x: 5,
      y,
      width,
      height: 10,
      tooltip,
      text,
      isChecked,
      onChange,
    };
}

function subscribeToStaffFixesVandalism(bool) {
    // Save the selected setting in the sharedStorage
    config.setPluginEnabled(bool);

    if (bool) {
        // When true, the selected staff will start fixing vandalized additions they encounter
        staffFixesVandalismSubscription = context.subscribe(
            'interval.tick',
            function() {
                fixVandalismWithSelectedStaff()
            }
        );   
    } else {
        // When false, the staff will stop fixing vandalized additions
        if (staffFixesVandalismSubscription) {
            staffFixesVandalismSubscription.dispose();
        }
    }
}

function fixVandalismWithSelectedStaff() {
    // Checks the tiles of selected staff types for vandalism to repair it immediately if there is money available

    // Check for vandalization once every half second to cut down on unnecessary calculations
    // Handymen with a walking speed of about 1 tile every second was used as baseline
    // So practically staff checks every tile they walk on while moving at least twice
    // RCT2 runs on 40 ticks per second, so execute once every 20 ticks
    tickCounter = (tickCounter+1) % 20; 
    if (tickCounter === 0) {
        // Get a list of all staff members
        var allStaff = map.getAllEntities('staff');

        // Go over all staff members
        for (var staffNum = 0; staffNum < allStaff.length; staffNum++) {
            // Get corresponding staff member
            var sm = allStaff[staffNum];
            
            // If the staff member type is assigned to fix vandalization
            if (staffTypeIncluded(sm.staffType)) {
                // Get the tile the staff member is walking on 
                // Divide by 32 to convert the location to a tile coordinate
                var smTile = map.getTile(sm.x/32, sm.y/32);
                
                // Iterate every element on the tile
                for (var elemNum = 0; elemNum < smTile.numElements; elemNum++) {
                    var element = smTile.getElement(elemNum);

                    // If the element is a footpath on the same height as the staff member
                    if (element.type === 'footpath' && element.baseZ === sm.z) {

                        // If the addition has been vandalized, and at least 1 edge isn't connected (addition is visible)
                        if (element.isAdditionBroken && element.edges !== 15) {

                            // Repair the addition for free if playing without money
                            if (park.getFlag("noMoney")) {
                                element.isAdditionBroken = false;
                            }

                            else {
                                // Repair the element and deduct the repair costs
                                context.executeAction(
                                    "footpathadditionplace",
                                    {
                                        x: smTile.x * 32,
                                        y: smTile.y * 32,
                                        z: sm.z,
                                        object: context.getObject("footpath_addition", element.addition).index,
                                    },
                                    function(_a) {
                                        if (_a.cost) {
                                            park.cash -= _a.cost * config.getRepairCostFactor() - _a.cost;
                                        }
                                    }
                                );
                            }
                        }

                        // No need to look for more footpaths if the one being walked on is found
                        break;
                    }
                }
            }
        }
    }
}

// --- Helper functions ---

function staffTypeIncluded(staffType) {
    // Helper function to determine whether a specific staff type is set to fix vandalism

    var included = false;
    switch (staffType) {
        case "handyman":
            included = config.getHandymenFixVandalism();
            break;
        
        case "mechanic":
            included = config.getMechanicsFixVandalism();
            break;

        case "security":
            included = config.getGuardsFixVandalism();
            break;

        case "entertainer":
            included = config.getEntertainersFixVandalism();
            break;

        default:
            included = false;
            break;
    }
    return included;
}

// --- Configuration ---
// Shorthands for <namespace><dot><configname>
const pluginEnabled = 'FixVandalismWithStaff.pluginEnabled';
const handymenFixVandalism = 'FixVandalismWithStaff.handymenFixVandalism';
const mechanicsFixVandalism = 'FixVandalismWithStaff.mechanicsFixVandalism';
const guardsFixVandalism = 'FixVandalismWithStaff.guardsFixVandalism';
const entertainersFixVandalism = 'FixVandalismWithStaff.entertainersFixVandalism';
const repairCostFactor = 'FixVandalismWithStaff.repairCostFactor';

// Default configuration values
const defaults = {
    pluginEnabled: true,
    handymenFixVandalism: true,
    mechanicsFixVandalism: false,
    guardsFixVandalism: false,
    entertainersFixVandalism: false,
    repairCostFactor: 1.00,
};

// For interacting with the sharedStorage
const config = {
    // Plugin enabled
    getPluginEnabled() {
        return context.sharedStorage.get(pluginEnabled, defaults.pluginEnabled);
    },

    setPluginEnabled(bool) {
        return context.sharedStorage.set(pluginEnabled, bool);
    },

    // Handymen
    getHandymenFixVandalism() {
        return context.sharedStorage.get(handymenFixVandalism, defaults.handymenFixVandalism);
    },

    setHandymenFixVandalism(bool) {
        return context.sharedStorage.set(handymenFixVandalism, bool);
    },

    // Mechanics
    getMechanicsFixVandalism() {
        return context.sharedStorage.get(mechanicsFixVandalism, defaults.mechanicsFixVandalism);
    },

    setMechanicsFixVandalism(bool) {
        return context.sharedStorage.set(mechanicsFixVandalism, bool);
    },

    // Security guards
    getGuardsFixVandalism() {
        return context.sharedStorage.get(guardsFixVandalism, defaults.guardsFixVandalism);
    },

    setGuardsFixVandalism(bool) {
        return context.sharedStorage.set(guardsFixVandalism, bool);
    },

    // Entertainers
    getEntertainersFixVandalism() {
        return context.sharedStorage.get(entertainersFixVandalism, defaults.entertainersFixVandalism);
    },

    setEntertainersFixVandalism(bool) {
        return context.sharedStorage.set(entertainersFixVandalism, bool);
    },

    // Repair cost factor
    getRepairCostFactor() {
        return context.sharedStorage.get(repairCostFactor, defaults.repairCostFactor);
    },

    setRepairCostFactor(num) {
        return context.sharedStorage.set(repairCostFactor, num);
    }
};

// Options to customize the repair cost, from cheaper than base cost to substantially more expensive
const repairCostOptions = [
    {s: 'Free', n: 0.00},
    {s: '10%', n: 0.10},
    {s: '25%', n: 0.25},
    {s: '50%', n: 0.50},
    {s: '100%', n: 1.00},
    {s: '150%', n: 1.50},
    {s: '250%', n: 2.50},
    {s: '500%', n: 5.00},
    {s: '1000%', n: 10.00},
    {s: '10000%', n: 100.00},
];

// --- Plugin registry ---
registerPlugin({
    name: 'Fix vandalism with staff',
    version: '1.1',
    authors: ['Wessel Ammerlaan', 'PhasecoreX'],
    type: 'remote',
    licence: 'MIT',
    main: main
});
