import { Button, Flex, Text, useColorMode } from "@chakra-ui/react";

export default function Gallery() {

  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Flex>
      <Text color={'white'}>hello</Text>
      <Button onClick={toggleColorMode}>
        Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
      </Button>
    </Flex>
  )
}