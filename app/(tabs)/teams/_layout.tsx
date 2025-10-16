// app/(tabs)/teams/_layout.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import TeamsHome from "./index";
import CreateTeamScreen from "./create";
import MembersScreen from "./members";
import TeamCalendarScreen from "./calendar";

const Stack = createNativeStackNavigator();

export default function TeamsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="index"
        component={TeamsHome}
        options={{ title: "Teams" }}
      />
      <Stack.Screen
        name="create"
        component={CreateTeamScreen}
        options={{ title: "Create Team" }}
      />
      <Stack.Screen
        name="members"
        component={MembersScreen}
        options={{ title: "Team Members" }}
      />
      <Stack.Screen
        name="calendar"
        component={TeamCalendarScreen}
        options={{ title: "Team Calendar" }}
      />
    </Stack.Navigator>
  );
}
