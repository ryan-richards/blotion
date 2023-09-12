import { Badge, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from "@chakra-ui/react"
import { Form } from "@remix-run/react";

function UpgradeModal({ isOpen, onOpen, onClose }: any) {
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Upgrade your account</ModalHeader>
                    <ModalCloseButton
                    />
                    <ModalBody>
                        <Text>To publish your first blog, please upgrade to a paid <Badge
                            minW={"50px"}
                            maxWidth={"70px"}
                            h={"20px"}
                            variant={"subtle"}
                            colorScheme={"purple"}
                            textAlign={"center"}
                            width={"50%"}
                        >
                            creative
                        </Badge> or <Badge
                            minW={"30px"}
                            maxWidth={"70px"}
                            h={"20px"}
                            variant={"subtle"}
                            colorScheme={"blue"}
                            textAlign={"center"}
                            width={"30%"}
                        >
                                pro
                            </Badge> plan</Text>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant='ghost' mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Form
                            method={"get"}
                            action={"/pricing"}
                        >
                            <Button
                                size={"sm"}
                                minW={"100px"}
                                colorScheme={"blue"}
                                variant={"outline"}
                                type={"submit"}
                            >
                                Upgrade
                            </Button>
                        </Form>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default UpgradeModal;