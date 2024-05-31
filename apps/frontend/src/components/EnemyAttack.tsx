import {Flex, Box, Text, SimpleGrid} from "@chakra-ui/react";
import {Enemy} from "../types/GameData";

export default function EnemyAttack({attack}: {attack: Enemy["attacks"][number]}){
    const rangeValues = (range: number): string => {
        if (range < 25){
            return "Very Short";
        } else if (range < 50){
            return "Short";
        } else if (range < 75){
            return "Medium";
        } else if (range < 100){
            return "Long";
        }
        return "Very Long";
    };

    const knockbackValues = (knockback: number): string => {
        if (knockback < 55){
            return "Weak";
        } else if (knockback < 80){
            return "Medium";
        }
        return "Strong";
    };

    let dpsName = "Damage";
    let dpsText = "0";
    let showReload = true;
    let damageType = "";

    if (
        attack.reload > 0 && attack.damageType === 0 && 
        ((attack.displayName.includes("Default") && attack.reload <= 3.6) || attack.reload <= 2.4)
    ){
        dpsName = "Damage per second";
        showReload = false;

        if (attack.minDamage < attack.maxDamage){
            dpsText = `${Math.ceil(attack.minDamage / attack.reload)} - ${Math.ceil(attack.maxDamage / attack.reload)}`;
        } else if (attack.minDamage > attack.maxDamage){
            dpsText = `${Math.ceil(attack.maxDamage / attack.reload)} - ${Math.ceil(attack.minDamage / attack.reload)}`;
        } else{
            dpsText = `${Math.ceil(attack.minDamage / attack.reload)}`;
        }
    } else{
        if (attack.damageType === 1 || attack.damageType === 2){
            dpsText = `${attack.minDamage} %`;
        } else{
            dpsText = `${attack.minDamage}`;
        }
    }

    if (attack.damageType === 1){
        damageType = "% of max health";
    } else if (attack.damageType === 2){
        damageType = "% of current health";
    }

    return (
        <Flex key={`${attack.displayName}${attack.minDamage}`} flexDir={"column"} bgColor={"blue.800"} p={"0.5em"} borderRadius={"xl"}>
            <Text fontSize={"xl"} className={"heading-xl"}>{attack.displayName}</Text>
            <Text fontSize={"lg"} className={"heading-lg"} lineHeight={1.2} mt={1} mb={3}>{attack.description}</Text>
            <Flex w={"100%"} flex={1} alignItems={"flex-end"}>
            <SimpleGrid columns={[1, 2]} templateRows={["1fr 1fr 1fr 1fr 1fr 1fr", "1fr 1fr 1fr"]} spacing={2} w={"100%"} h={"fit-content"}>
                <Box className={"enemy-stat-box"}>
                    <Text variant={"enemyStatName"}>{dpsName}</Text>
                    <Text variant={"enemyAttackStatValue"}>{dpsText}</Text>
                </Box>
                {damageType !== "" && <Box className={"enemy-stat-box"}>
                    <Text variant={"enemyStatName"}>Damage type</Text>
                    <Text variant={"enemyAttackStatValue"}>{damageType}</Text>
                </Box>}
                {showReload && <Box className={"enemy-stat-box"}>
                    <Text variant={"enemyStatName"}>Attack Rate</Text>
                    <Text variant={"enemyAttackStatValue"}>{attack.reload > 0 ? `${attack.reload}s` : "Used only once"}</Text>
                </Box>}
                <Box className={"enemy-stat-box"}>
                    <Text variant={"enemyStatName"}>Range</Text>
                    <Text variant={"enemyAttackStatValue"}>{rangeValues(attack.range)}</Text>{/* `${rangeValues(attack.range)} (${attack.range})` */}
                </Box>
                {attack.knockback > 0 && <Box className={"enemy-stat-box"}>
                    <Text variant={"enemyStatName"}>Knockback</Text>
                    <Text variant={"enemyAttackStatValue"}>{knockbackValues(attack.knockback)}</Text>{/* `${knockbackValues(attack.knockback)} (${attack.knockback})` */}
                </Box>}
                {attack.fireDamage > 0 && <Box className={"enemy-stat-box"}>
                    <Text variant={"enemyStatName"}>Fire Damage</Text>
                    <Text variant={"enemyAttackStatValue"}>{attack.fireDamage}</Text>
                </Box>}
            </SimpleGrid>
            </Flex>
        </Flex>
    );
}
