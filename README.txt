================================================================
  HANDHELD RPG — CAMPAIGN WRITER
  Preview Build
================================================================

Thank you for testing Handheld RPG Writer! This tool lets you
design campaigns for the Handheld RPG engine: write scenes,
connect them into branching narratives, manage items, quests,
monsters, classes, and spells — all in one desktop app.

----------------------------------------------------------------
INSTALLATION
----------------------------------------------------------------

macOS
  Open the .dmg file, drag "Handheld RPG" to your Applications
  folder, then double-click it to launch.

  IMPORTANT: Because this is an unsigned preview build, macOS
  will block it the first time. To open it:
    1. Right-click the app icon
    2. Choose "Open"
    3. Click "Open" in the dialog that appears
  You only need to do this once.

Windows
  Run the .exe installer (NSIS) or the .msi file and follow
  the prompts. Windows SmartScreen may warn you about an
  "unrecognized app" — click "More info" then "Run anyway".

----------------------------------------------------------------
GETTING STARTED
----------------------------------------------------------------

When you launch the app you land on the home screen with two
options:

  Load Campaign
    Opens your existing engine campaign. Select the
    manifest.json file from your campaign folder. The app reads
    all related files automatically (campaign.json, items.json,
    quests.json, monster_definitions.json, classes.json).

  New Story
    Starts a blank project from scratch. Enter a title and
    author name and you'll be taken straight to the editor.

To save your work at any time, click the "Save" button in the
top-right corner of the editor. The first save asks you where
to put the file; after that it saves in place.

----------------------------------------------------------------
THE EDITOR — TABS OVERVIEW
----------------------------------------------------------------

The sidebar on the left has nine tabs. Here is what each does:


[ Structure ]
  A visual canvas showing all your scenes as cards connected
  by arrows. Each arrow represents a choice that leads from
  one scene to another.

  - Drag scenes to rearrange them.
  - Click "Auto-layout" to have the app organise the graph.
  - Click a scene card to open it in the Scenes editor.
  - The label on each arrow is the text of the choice.
    If it says "[write choice text]" that choice has no label
    yet — go to the Scenes tab to fill it in.
  - The start scene is highlighted. Right-click a scene card
    to set it as the start scene.


[ Scenes ]
  The main writing area. Each scene is one "moment" in the
  story that the player reads and then makes a decision.

  Fields per scene:
    Title       — human-readable name shown in the editor
    Scene ID    — the internal key used in JSON (auto-generated
                  from the title; you can override it)
    Template    — optional hint for the engine renderer:
                    location   — place/environment scene
                    item_found — player discovers an item
                    text_scene — pure narrative, no choices
    Can Revisit — if checked, the player can return to this
                  scene after leaving it
    Can Go Back — if checked, the engine shows a "go back"
                  button to the previous scene
    Has Asset   — attach an image reference (e.g.
                  campaign://assets/forest.png)
    Narrative   — the text the player reads

  Choices
    Each choice is one option the player can pick. A scene
    with no choices is a story endpoint (game over / credits).

    Choice fields:
      Choice Text  — what the player sees and taps
      Destination  — either a next scene or a special action
                     string (e.g. "return_to_main_menu")

    Conditions (choice is hidden unless ALL are met):
      Player has items         — requires listed items in bag
      Player is missing items  — requires items NOT in bag
      Flags match              — requires named flags to be
                                 true or false

    Effects (happen when the player picks this choice):
      Add items to inventory   — gives the player items
      Remove items             — takes items away
      Start quests             — marks quests as active
      Complete quests          — marks quests as done
      Fail quests              — marks quests as failed
      Set flags                — turns named flags on or off
      Heal HP                  — restores a fixed amount of HP
      Full heal                — restores HP to maximum


[ Items ]
  All collectible items in the campaign. The name you enter
  here is what appears in dropdowns throughout the Scenes tab
  when you add inventory effects or conditions.

  Fields: Name, Description
  The "Ref" column shows the item's ID (used in JSON).


[ Quests ]
  Trackable objectives. Once a quest is created here, you can
  start, complete, or fail it from any choice in Scenes.

  Fields: Name, Description


[ Monsters ]
  Reference table for all monsters in the campaign, loaded
  from monster_definitions.json. You can see their stats here
  but full monster editing is done in your campaign files.

  Columns: Ref | Name | Asset | HP | AC | Init | Atk | Dmg | Spells


[ Classes ]
  Playable character classes. Each class has base stats, combat
  values, and a list of spells it can use. You can create and
  edit classes directly in the app.

  Stats: STR / DEX / CON / INT / WIS / CHA
  Combat: Armor Class, Attack Stat, Attack Bonus, Damage
  Spells: assigned from the global spell registry (see Spells)


[ Spells ]
  The global spell registry. Spells can be assigned to one or
  more classes. Each spell has a type (damage or heal), the
  stat it scales with, a power value, and an attack bonus.

  Creating a spell here also lets you check which classes it
  belongs to and reassign it from the form.


[ Assets ]
  (Coming soon) Will manage image and audio asset references
  and map them to the campaign package structure.


[ Templates ]
  (Coming soon) Reusable scene and choice blueprints you can
  drop into any story.

----------------------------------------------------------------
FLAGS — HOW THEY WORK
----------------------------------------------------------------

Flags are simple named boolean switches (true / false) that
the engine tracks at runtime. You don't pre-register them —
you just use them by name in choices.

Example flow:
  Scene "cave_entrance":
    Choice "Search the chest"
      Effect: Set flag  found_key = true

  Scene "locked_door":
    Choice "Unlock the door"
      Condition: Flag  found_key = true

The Scenes tab autocompletes flag names from flags you have
already used elsewhere in the story.

----------------------------------------------------------------
JSON FILE TEMPLATES
----------------------------------------------------------------

If you are writing campaign files by hand or want to know
the format the app reads and writes, here are minimal examples.


-- manifest.json -------------------------------------------

{
  "id": "my_campaign",
  "title": "My Campaign",
  "version": "1.0",
  "author": "Your Name",
  "description": "A short description of the campaign.",
  "start_scene": "intro",
  "campaign_file": "campaign.json",
  "items_file": "items.json",
  "quests_file": "quests.json"
}


-- campaign.json --------------------------------------------

{
  "id": "my_campaign",
  "title": "My Campaign",
  "start_scene": "intro",
  "scenes": {
    "intro": {
      "title": "The Beginning",
      "text": "You stand at the edge of a dark forest.",
      "can_revisit": false,
      "can_go_back": false,
      "asset": "campaign://assets/forest_edge.png",
      "choices": [
        {
          "text": "Enter the forest",
          "next_scene": "forest_path",
          "add_items": [],
          "remove_items": [],
          "requires_items": [],
          "requires_missing_items": [],
          "requires_flags": {},
          "set_flags": { "entered_forest": true },
          "start_quests": ["find_the_relic"],
          "complete_quests": [],
          "fail_quests": []
        },
        {
          "text": "Turn back",
          "next_scene": "town_square"
        }
      ]
    },
    "forest_path": {
      "title": "Forest Path",
      "text": "Tall trees close in around you.",
      "choices": []
    }
  }
}

Notes:
  - "scenes" is a dictionary keyed by scene ID.
  - A scene with no choices is a story endpoint.
  - All array fields default to [] if omitted.
  - "asset" follows the pattern campaign://assets/filename.


-- items.json -----------------------------------------------

{
  "health_potion": {
    "name": "Health Potion",
    "description": "Restores 10 HP when consumed."
  },
  "iron_key": {
    "name": "Iron Key",
    "description": "A heavy key that opens the old vault."
  },
  "ancient_map": {
    "name": "Ancient Map",
    "description": "Shows a path through the cursed swamp."
  }
}

Note: The top-level key (e.g. "health_potion") is the item's
      ID used in choice effects and conditions.


-- quests.json ----------------------------------------------

{
  "quests": {
    "find_the_relic": {
      "name": "Find the Relic",
      "description": "Recover the ancient relic from the ruins."
    },
    "rescue_the_elder": {
      "name": "Rescue the Elder",
      "description": "The village elder has been taken captive."
    }
  }
}

Note: The "quests" wrapper object is required.


-- monster_definitions.json ---------------------------------

{
  "goblin_scout": {
    "name": "Goblin Scout",
    "asset": "campaign://assets/goblin.png",
    "hp": 15,
    "armor_class": 12,
    "initiative": 3,
    "attack_bonus": 2,
    "damage": 4,
    "spells": []
  },
  "forest_troll": {
    "name": "Forest Troll",
    "asset": "campaign://assets/troll.png",
    "hp": 60,
    "armor_class": 15,
    "initiative": 1,
    "attack_bonus": 5,
    "damage": 12,
    "spells": [
      {
        "id": "stone_throw",
        "name": "Stone Throw",
        "type": "damage",
        "stat": "strength",
        "power": 6,
        "attack_bonus": 3
      }
    ]
  }
}

Note: Monsters can embed their own spell definitions. The app
      extracts them into the global spell registry.


-- classes.json ---------------------------------------------

{
  "character_classes": {
    "warrior": {
      "name": "Warrior",
      "description": "A seasoned fighter who excels in melee combat.",
      "asset": "campaign://assets/warrior.png",
      "base_hp": 30,
      "stats": {
        "strength": 16,
        "dexterity": 10,
        "constitution": 14,
        "intelligence": 8,
        "wisdom": 10,
        "charisma": 10
      },
      "combat": {
        "armor_class": 14,
        "attack_stat": "strength",
        "attack_bonus": 4,
        "damage": 8
      },
      "spells": [],
      "inventory": ["iron_sword", "wooden_shield"]
    },
    "mage": {
      "name": "Mage",
      "description": "A scholar who bends arcane forces.",
      "base_hp": 16,
      "stats": {
        "strength": 8,
        "dexterity": 12,
        "constitution": 10,
        "intelligence": 18,
        "wisdom": 14,
        "charisma": 12
      },
      "combat": {
        "armor_class": 10,
        "attack_stat": "intelligence",
        "attack_bonus": 5,
        "damage": 4
      },
      "spells": [
        {
          "id": "fire_bolt",
          "name": "Fire Bolt",
          "type": "damage",
          "stat": "intelligence",
          "power": 8,
          "attack_bonus": 5
        },
        {
          "id": "mend",
          "name": "Mend",
          "type": "heal",
          "stat": "wisdom",
          "power": 6
        }
      ],
      "inventory": ["spellbook"]
    }
  }
}

Note: The "character_classes" wrapper object is required.
      Spells embedded in classes are extracted into a shared
      registry — the same spell ID appearing in multiple
      classes is stored only once.

----------------------------------------------------------------
TIPS
----------------------------------------------------------------

- All changes are auto-saved every 30 seconds to the last
  saved file. The "Unsaved" indicator appears in the top-right
  when there are unsaved changes.

- On the Structure canvas, if nodes overlap after adding many
  scenes, click "Auto-layout" to reorganise the graph.

- Scene IDs must be unique and contain only lowercase letters,
  numbers, and underscores (e.g. "dark_forest_path"). The app
  generates them automatically from the title.

- Flags are case-sensitive. "Found_Key" and "found_key" are
  two different flags.

- A scene with no choices ends the story at that point. Use
  this for endings, game over screens, or credit scenes.

- If a choice condition references an item or flag that does
  not exist at runtime, the engine treats the condition as
  not met and hides the choice.

----------------------------------------------------------------
KNOWN LIMITATIONS (Preview Build)
----------------------------------------------------------------

- Assets and Templates tabs are placeholders and not yet
  functional.
- There is no built-in encounter editor; encounters must be
  written directly in campaign.json.
- Export to multi-file campaign format (splitting back into
  manifest + campaign + items etc.) is not yet implemented.
  The app saves to a single combined .json file.
- No undo/redo yet.

----------------------------------------------------------------
FEEDBACK
----------------------------------------------------------------

This is an early preview. If something breaks, behaves oddly,
or you want a feature that is missing, please let the
developer know — your feedback directly shapes what gets
built next.

================================================================
