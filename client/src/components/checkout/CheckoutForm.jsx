import { Box, Flex, Input, Text } from "@chakra-ui/react";

export const CheckoutForm = ({ onChange }) => {
  return (
    <Box mt="30px">
      <Text fontSize="20px" fontWeight={600} mb="20px">
        Enter your name and address
      </Text>

      <Flex direction="column" gap="20px">
        <Input name="firstName" placeholder="First Name*" onChange={onChange} />
        <Input name="lastName" placeholder="Last Name*" onChange={onChange} />
        <Input
          name="addressLine1"
          placeholder="Address Line 1*"
          onChange={onChange}
        />
        <Input
          name="addressLine2"
          placeholder="Address Line 2"
          onChange={onChange}
        />

        <Flex gap="20px">
          <Input
            name="locality"
            placeholder="City / Locality*"
            onChange={onChange}
          />
          <Input
            name="pinCode"
            placeholder="Pin Code*"
            onChange={onChange}
          />
        </Flex>

        <Flex gap="20px">
          <Input
            name="state"
            placeholder="State / Territory*"
            onChange={onChange}
          />
          <Input
            name="country"
            placeholder="Country*"
            onChange={onChange}
          />
        </Flex>

        <Text fontSize="20px" fontWeight={600} mt="30px">
          Contact Information
        </Text>

        <Input name="email" placeholder="Email*" onChange={onChange} />
        <Input name="mobile" placeholder="Mobile*" onChange={onChange} />
      </Flex>
    </Box>
  );
};
