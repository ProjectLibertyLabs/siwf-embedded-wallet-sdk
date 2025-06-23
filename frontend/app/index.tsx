import React, { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { startSiwf } from "../utils/api";

export default function HomeScreen() {
  const [response, setResponse] = useState<any>();

  const userAddress = "0x123";
  const signatureFn = (
    address: string,
    standard: "eip712" | "caip122",
    payload: Object
  ) => "0x123456790";
  const gatewayFetchFn = () => console.log("gatewayFetchFn");
  const siwfSignedRequest = "0x0987654321";
  const msaCreationCallback = () => console.log("msaCreationCallback");
  const userHandle = "Alice";
  const email = "abc@123.com";

  const handleLoginClick = async () => {
    const startSiwfResponse = await startSiwf(
      userAddress,
      signatureFn,
      gatewayFetchFn,
      siwfSignedRequest,
      msaCreationCallback,
      userHandle,
      email
    );
    setResponse(startSiwfResponse);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Embedded Wallet Demo App</Text>
      <Button title="Login" onPress={handleLoginClick} />
      {response && (
        <View style={styles.responseBox}>
          <Text style={styles.responseTitle}>Response:</Text>
          <Text>{JSON.stringify(response)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 50,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  responseBox: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  responseTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
});
