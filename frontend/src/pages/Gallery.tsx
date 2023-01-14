import { Button, Flex, Text, useColorMode } from "@chakra-ui/react";
import SkullBackground from "../components/SkullBackground";

export default function Gallery() {

  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Flex>
      <Text color={'white'}>hello</Text>
      <Button onClick={toggleColorMode}>
        Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
      </Button>
      <SkullBackground/>
      <Flex flexDir={'column'}>
        <Text>Backgrounds</Text>
        <Flex>

        </Flex>
      </Flex>
    </Flex>
  )
}