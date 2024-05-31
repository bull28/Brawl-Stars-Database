import {Flex, Box, Text, SimpleGrid} from "@chakra-ui/react";
import {Enemy} from "../types/GameData";

export default function EnemyAttack({attack}: {attack: Enemy["attacks"][number]}){
    return (
        <Flex key={`${attack.displayName}${attack.minDamage}`} flexDir={"column"} bgColor={"#000080"}>
            <Text fontSize={"xl"} className={"heading-xl"}>{attack.displayName}</Text>
            <Text fontSize={"lg"} className={"heading-lg"}>{attack.description}</Text>
            <Flex w={"100%"} flex={1} alignItems={"flex-end"}>
            <SimpleGrid columns={2} spacing={2} w={"100%"} h={"fit-content"}>
                <Box className={"enemy-stat-box"}>
                    <Text className={"enemy-stat-name"}>Damage Per Second</Text>
                    <Text className={"enemy-stat-value"}>{attack.minDamage}</Text>
                </Box>
                <Box className={"enemy-stat-box"}>
                    <Text className={"enemy-stat-name"}>Damage Type</Text>
                    <Text className={"enemy-stat-value"}>{attack.damageType}</Text>
                </Box>
                <Box className={"enemy-stat-box"}>
                    <Text className={"enemy-stat-name"}>Attack Rate</Text>
                    <Text className={"enemy-stat-value"}>{`${attack.reload}s`}</Text>
                </Box>
                <Box className={"enemy-stat-box"}>
                    <Text className={"enemy-stat-name"}>Range</Text>
                    <Text className={"enemy-stat-value"}>{attack.range}</Text>
                </Box>
                <Box className={"enemy-stat-box"}>
                    <Text className={"enemy-stat-name"}>Knockback</Text>
                    <Text className={"enemy-stat-value"}>{attack.knockback}</Text>
                </Box>
                <Box className={"enemy-stat-box"}>
                    <Text className={"enemy-stat-name"}>Fire Damage</Text>
                    <Text className={"enemy-stat-value"}>{attack.fireDamage}</Text>
                </Box>
            </SimpleGrid>
            </Flex>
        </Flex>
    );
}
