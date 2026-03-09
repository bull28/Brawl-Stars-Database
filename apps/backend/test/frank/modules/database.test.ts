import {expect} from "chai";
import characterList from "../../../frank/data/characters_data.json";
import accessoryList from "../../../frank/data/accessories_data.json";
import {bufferUtils} from "../../../frank/modules/database";
import {UserCharacter, UserAccessory, TrialData} from "../../../frank/types";
import {generateSampleTrial} from "../database_setup";

describe("Database module", function(){
    it("Convert buffer to character list", function(){
        const size = bufferUtils.CHARACTER_BYTES;
        const buffer = new ArrayBuffer(size * characterList.length);
        const view = new DataView(buffer);

        for (let x = 0; x < characterList.length; x++){
            view.setUint16(x * size, 0x208, true);
        }

        const characters = bufferUtils.bufferToCharacters(new Uint8Array(buffer));

        expect(characters).to.be.an("array");
        expect(characters).to.have.lengthOf(characterList.length);
        for (let x = 0; x < characterList.length; x++){
            expect(characters[x].name).to.equal(characterList[x].name);
            expect(characters[x].tier).to.equal(0x208);
        }

        const invalidBuffer = new ArrayBuffer(size * Math.max(1, 2, characterList.length - 1));

        const invalid = bufferUtils.bufferToCharacters(new Uint8Array(invalidBuffer));
        expect(invalid).to.be.an("array");
        expect(invalid).to.have.lengthOf(0);
    });

    it("Convert buffer to accessory list", function(){
        const size = bufferUtils.ACCESSORY_BYTES;
        const buffer = new ArrayBuffer(size * accessoryList.length);
        const view = new DataView(buffer);

        for (let x = 0; x < accessoryList.length; x++){
            if (x % 2 === 0){
                view.setUint32(x * size, 0x8000286d, true);
            } else{
                view.setUint32(x * size, 0x0000286d, true);
            }
        }

        const accessories = bufferUtils.bufferToAccessories(new Uint8Array(buffer));

        expect(accessories).to.be.an("array");
        expect(accessories).to.have.lengthOf(accessoryList.length);
        for (let x = 0; x < accessoryList.length; x++){
            expect(accessories[x].name).to.equal(accessoryList[x].name);
            expect(accessories[x].badges).to.equal(0x286d);
            expect(accessories[x].unlocked).to.equal(x % 2 === 0);
        }

        const invalidBuffer = new ArrayBuffer(size * Math.max(1, 2, accessoryList.length - 1));

        const invalid = bufferUtils.bufferToAccessories(new Uint8Array(invalidBuffer));
        expect(invalid).to.be.an("array");
        expect(invalid).to.have.lengthOf(0);
    });

    it("Convert character list to buffer", function(){
        const size = bufferUtils.CHARACTER_BYTES;

        const characters: UserCharacter[] = [];
        for (let x = 0; x < characterList.length; x++){
            characters.push({name: characterList[x].name, tier: 0x208});
        }

        const buffer = bufferUtils.charactersToBuffer(characters);
        const view = new DataView(buffer.buffer);
        expect(buffer.byteLength).to.equal(size * characterList.length);
        for (let x = 0; x < characterList.length; x++){
            expect(view.getUint16(x * size, true)).to.equal(0x208);
        }

        const invalidBuffer = bufferUtils.charactersToBuffer(characters.slice(0, characters.length - 1));
        const invalidView = new DataView(invalidBuffer.buffer);
        expect(invalidBuffer.byteLength).to.equal(size * characterList.length);
        for (let x = 0; x < characterList.length; x++){
            expect(invalidView.getUint16(x * size, true)).to.equal(0);
        }
    });

    it("Convert accessory list to buffer", function(){
        const size = bufferUtils.ACCESSORY_BYTES;

        const accessories: UserAccessory[] = [];
        for (let x = 0; x < accessoryList.length; x++){
            accessories.push({name: accessoryList[x].name, badges: 0x286d, unlocked: x % 2 === 0});
        }

        const buffer = bufferUtils.accessoriesToBuffer(accessories);
        const view = new DataView(buffer.buffer);
        expect(buffer.byteLength).to.equal(size * accessoryList.length);
        for (let x = 0; x < accessoryList.length; x++){
            expect(view.getInt32(x * size, true)).to.equal(~(x & 1) << 31 | 0x286d);
        }

        const invalidBuffer = bufferUtils.accessoriesToBuffer(accessories.slice(0, accessories.length - 1));
        const invalidView = new DataView(invalidBuffer.buffer);
        expect(invalidBuffer.byteLength).to.equal(size * accessoryList.length);
        for (let x = 0; x < accessoryList.length; x++){
            expect(invalidView.getInt32(x * size, true)).to.equal(0);
        }
    });

    it("Two-way conversion with character list", function(){
        const characters: UserCharacter[] = [];
        for (let x = 0; x < characterList.length; x++){
            characters.push({name: characterList[x].name, tier: 0x208});
        }

        const newCharacters = bufferUtils.bufferToCharacters(bufferUtils.charactersToBuffer(characters));
        expect(characters).to.eql(newCharacters);
    });

    it("Two-way conversion with accessory list", function(){
        const accessories: UserAccessory[] = [];
        for (let x = 0; x < accessoryList.length; x++){
            accessories.push({name: accessoryList[x].name, badges: 0x286d, unlocked: x % 2 === 0});
        }

        const newAccessories = bufferUtils.bufferToAccessories(bufferUtils.accessoriesToBuffer(accessories));
        expect(accessories).to.eql(newAccessories);
    });

    it("Two-way conversion with trial", function(){
        const trial = generateSampleTrial();
        let totalLength = bufferUtils.TRIAL_HEADER_VALUES + bufferUtils.TRIAL_VALUE_TYPES +
        Math.max(0, trial.maxBuilds - trial.characterBuilds.length);

        for (const x in trial){
            const value = trial[x as keyof TrialData];
            if (Array.isArray(value) === true){
                totalLength += value.length;
            } else if (typeof value === "object"){
                totalLength += Object.keys(value).length;
            }
        }

        const buffer = bufferUtils.trialToBuffer(trial);
        expect(buffer.byteLength).to.equal(bufferUtils.TRIAL_BYTES * totalLength);

        const trial2 = bufferUtils.bufferToTrial(buffer)!;

        expect(Object.keys(trial)).to.eql(Object.keys(trial2));
        for (const x in trial2){
            const key = x as keyof TrialData;
            expect(trial2[key]).to.eql(trial[key]);
        }
    });

    it("Increasing maximum character builds in a trial", function(){
        const trial = generateSampleTrial();
        const buffer = bufferUtils.trialToBuffer(trial);

        let initialMax = trial.maxBuilds;
        for (let x = trial.characterBuilds.length; x < initialMax; x++){
            trial.characterBuilds.push(0);
        }
        trial.maxBuilds *= 2;

        const buffer2 = bufferUtils.trialToBuffer(trial);
        expect(buffer2.byteLength).to.equal(buffer.byteLength + bufferUtils.TRIAL_BYTES * initialMax);

        const trial2 = bufferUtils.bufferToTrial(buffer2)!;
        expect(trial2.maxBuilds).to.equal(trial.maxBuilds);
        expect(trial2.characterBuilds).to.eql(trial.characterBuilds);

        trial2.characterBuilds.splice(0, trial.characterBuilds.length);
        expect(bufferUtils.trialToBuffer(trial2).byteLength).to.equal(buffer2.byteLength);
    });
});
