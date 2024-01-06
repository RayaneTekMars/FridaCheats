"use strict";
const sizeOfAHero = 1170; // Size in bytes of a hero structure in memory

// ! ALL THE HARD CODED ADDRESSES HAVE BEEN FOUND WITH CHEAT ENGINE !

/**
 * Class representing a player of Heroes of Might and Magic 3
 * @class Player
 * @example
 * const player = new Player(baseAddr);
 * player.setValue("wood", 1000);
 */
class Player {

    constructor(baseAddr) {
        this.baseAddr = baseAddr; // Base address of the game
        this.playerPtr = baseAddr.add(0x0029ccb0).readPointer(); // Pointer to the player
        this.heroArrayPtr = baseAddr.add(0x2994e8).readPointer().add(0x21620); // Pointer to the array of heroes
        this.heroIndex = this.playerPtr.add(0x4).readS32(); // Index of the current hero
        this.currentHero = new Hero(this.heroIndex, this.heroArrayPtr); // Current hero
        this.ressources = { // Ressources of the player
            wood: this.playerPtr.add(0x9c).readS32(), // Read the value at the address playerPtr + 0x9c (wood)
            mercury: this.playerPtr.add(0xa0).readS32(), // Read the value at the address playerPtr + 0xa0 (mercury)
            ore: this.playerPtr.add(0xa4).readS32(), // Read the value at the address playerPtr + 0xa4 (ore)
            sulfur: this.playerPtr.add(0xa8).readS32(), // Read the value at the address playerPtr + 0xa8 (sulfur)
            crystal: this.playerPtr.add(0xac).readS32(), // Read the value at the address playerPtr + 0xac (crystal)
            gem: this.playerPtr.add(0xb0).readS32(), // Read the value at the address playerPtr + 0xb0 (gem)
            gold: this.playerPtr.add(0xb4).readS32(), // Read the value at the address playerPtr + 0xb4 (gold)
        };
    }

    /**
     * Set the value of the player
     * @param {string} name Name of the value to set
     * @param {number} value Value to set
     * @memberof Player
     * @example
     * player.setValue("wood", 1000);
     * player.setValue("gold", 1000);
     * player.setValue("xp", 1000);
     */
    setValue(name, value) {
        switch (name) {
            case "wood":
                this.playerPtr.add(0x9c).writeS32(value); // Write the value at the address playerPtr + 0x9c (wood)
                break;
            case "mercury":
                this.playerPtr.add(0xa0).writeS32(value); // Write the value at the address playerPtr + 0xa0 (mercury)
                break;
            case "ore":
                this.playerPtr.add(0xa4).writeS32(value); // Write the value at the address playerPtr + 0xa4 (ore)
                break;
            case "sulfur":
                this.playerPtr.add(0xa8).writeS32(value); // Write the value at the address playerPtr + 0xa8 (sulfur)
                break;
            case "crystal":
                this.playerPtr.add(0xac).writeS32(value); // Write the value at the address playerPtr + 0xac (crystal)
                break;
            case "gem":
                this.playerPtr.add(0xb0).writeS32(value); // Write the value at the address playerPtr + 0xb0 (gem)
                break;
            case "gold":
                this.playerPtr.add(0xb4).writeS32(value); // Write the value at the address playerPtr + 0xb4 (gold)
                break;
            case "xp":
                this.currentHero.setXP(value);
                break;
            case "level":
                this.currentHero.setLevel(value);
                break;
            case "movelimit":
                this.currentHero.setMovementLimit(value);
                break;
            default:
                console.log(`Unknown value name: ${name}`);
                console.log("Type \"help set\" for more informations");
                break;
        }
    }

    /**
     * Update the player
     * @returns {Player} The updated player
     * @memberof Player
     * @example
     * player.update();
     */
    update() {
        this.playerPtr = this.baseAddr.add(0x0029ccb0).readPointer();
        this.heroArrayPtr = this.baseAddr.add(0x2994e8).readPointer().add(0x21620);
        this.heroIndex = this.playerPtr.add(0x4).readS32();
        this.currentHero = new Hero(this.heroIndex, this.heroArrayPtr);
        this.ressources = {
            wood: this.playerPtr.add(0x9c).readS32(),
            mercury: this.playerPtr.add(0xa0).readS32(),
            ore: this.playerPtr.add(0xa4).readS32(),
            sulfur: this.playerPtr.add(0xa8).readS32(),
            crystal: this.playerPtr.add(0xac).readS32(),
            gem: this.playerPtr.add(0xb0).readS32(),
            gold: this.playerPtr.add(0xb4).readS32(),
        };
        return this;
    }

    /**
     * Print the player
     * @returns {string} String representation of the player
     * @memberof Player
     * @example
     * console.log(player.toString());
     */
    toString() {
        return (`@ Player:\n` +
            `+---| Current Hero (${this.heroIndex}):\n` +
            `|   +---| Name: ${this.currentHero.name}\n` +
            `|   +---| Level: ${this.currentHero.level}\n` +
            `|   +---| XP: ${this.currentHero.xp}\n` +
            `|   +---| Position: (${this.currentHero.x}, ${this.currentHero.y})\n` +
            `|   +---| Next position: (${this.currentHero.nextX}, ${this.currentHero.nextY})\n` +
            `|   \\---| Movement per day: ${this.currentHero.movementLimit}\n` +
            `|\n` +
            `\\---| Ressources:\n` +
            `    +---| Wood: ${this.ressources.wood}\n` +
            `    +---| Mercury: ${this.ressources.mercury}\n` +
            `    +---| Ore: ${this.ressources.ore}\n` +
            `    +---| Sulfur: ${this.ressources.sulfur}\n` +
            `    +---| Crystal: ${this.ressources.crystal}\n` +
            `    +---| Gem: ${this.ressources.gem}\n` +
            `    \\---| Gold: ${this.ressources.gold}\n`);
    }
}

/**
 * Class representing a hero of Heroes of Might and Magic 3
 * @class Hero
 * @example
 * const hero = new Hero(heroIndex, heroArrayPtr);
 */
class Hero {

    constructor(heroIndex, herosArrayPtr) {
        this.name = null;
        this.x = 0;
        this.y = 0;
        this.nextX = 0;
        this.nextY = 0;
        this.movementLimit = 0;
        this.xp = 0;
        this.level = 0;
        this.heroPtr = herosArrayPtr.add(heroIndex * sizeOfAHero); // Get the pointer to the hero (herosArrayPtr[heroIndex * sizeOfAHero])
        this.update();
    }

    /**
     * Set the xp of the hero
     * @param {string} xp XP to set
     * @memberof Hero
     * @example
     * hero.setXP(1000);
     */
    setXP(xp) {
        this.heroPtr.add(0x51).writeS32(xp); // Write the value at the address heroPtr + 0x51 (xp)
    }

    /**
     * Set the level of the hero
     * @param {string} level Level to set
     * @memberof Hero
     * @example
     * hero.setLevel(10);
     */
    setLevel(level) {
        this.heroPtr.add(0x55).writeS16(level); // Write the value at the address heroPtr + 0x55 (level)
    }

    /**
     * Set the movement per day of the hero
     * @param {number} movementLimit movement per day to set
     * @memberof Hero
     * @example
     * hero.setMovementLimit(1000);
     */
    setMovementLimit(movementLimit) {
        this.heroPtr.add(0x4d).writeS32(movementLimit); // Write the value at the address heroPtr + 0x4d (movementLimit)
    }

    /**
     * Update the hero
     * @returns {Hero} The updated hero
     * @memberof Hero
     * @example
     * hero.update();
     */
    update() {
        this.x = this.heroPtr.readS16(); // Read the value at the address heroPtr (x)
        this.y = this.heroPtr.add(0x2).readS16(); // Read the value at the address heroPtr + 0x2 (y)
        this.name = this.heroPtr.add(0x23).readCString(); // Read the value at the address heroPtr + 0x23 (name)
        this.nextX = this.heroPtr.add(0x35).readS32(); // Read the value at the address heroPtr + 0x35 (nextX)
        this.nextY = this.heroPtr.add(0x39).readS32(); // Read the value at the address heroPtr + 0x39 (nextY)
        this.movementLimit = this.heroPtr.add(0x4d).readS32(); // Read the value at the address heroPtr + 0x4d (movementLimit)
        this.xp = this.heroPtr.add(0x51).readS32(); // Read the value at the address heroPtr + 0x51 (xp)
        this.level = this.heroPtr.add(0x55).readS16(); // Read the value at the address heroPtr + 0x55 (level)
        return this;
    }

    /**
     * Print the hero
     * @returns {string} String representation of the hero
     * @memberof Hero
     * @example
     * console.log(hero.toString());
     */
    toString() {
        return (`Hero: ${this.name} (level ${this.level} / ${this.xp} xp)\n` +
            `Position: (${this.x}, ${this.y})\n` +
            `Next position: (${this.nextX}, ${this.nextY})\n` +
            `Movement per day: ${this.movementLimit}\n`);
    }
}


// Initialize the player if possible
function initPlayer() {
    if (player === null && baseAddr) {
        try {
            player = new Player(baseAddr);
        }
        catch (e) {
            console.log("Player not initialized");
            console.log("You must be in the game campain to initialize the player");
        }
    }
}

const baseAddr = Module.findBaseAddress("HEROES3.EXE"); // Get the base address of the game
if (!baseAddr) {
    throw new Error("Base address not found");
}

let player = null; // Player of the game

rpc.exports = {
    // API functions to interact with the player from the python script
    setplayer: function (name, value) {
        initPlayer();
        if (player) {
            try {
                player.setValue(name, value);
            }
            catch (e) {
                console.log("Error while setting player value");
                console.log(e);
            }
        }
    },
    printplayer: function () {
        initPlayer();
        if (player) {
            try {
                return player.update().toString();
            }
            catch (e) {
                console.log("Error while printing player");
                console.log(e);
            }
        }
    },
};
