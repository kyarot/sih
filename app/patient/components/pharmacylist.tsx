import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "../../../components/TranslateProvider"; 

export default function PharmacyList() {
  const { t } = useTranslation(); // ✅ hook

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{t("pharmacy_list_screen")}</Text>
    </View>
  );
}
