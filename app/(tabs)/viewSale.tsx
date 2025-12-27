import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";

import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSalesStore } from "../../stores/salesStore";
import { colors } from "../theme";

export default function ViewSale() {
  const sales = useSalesStore((state) => state.sales);
  const fetchSales = useSalesStore((state) => state.fetchSales);
  const updatePaid = useSalesStore((state) => state.updatePaidAmount);

  /* -------- SEARCH STATES -------- */
  const [customerSearch, setCustomerSearch] = useState("");
  const [totalSearch, setTotalSearch] = useState("");
  const [paidSearch, setPaidSearch] = useState("");
  const [balanceSearch, setBalanceSearch] = useState("");

  /* -------- DATE STATES -------- */
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  /* -------- FILTER LOGIC -------- */
  const filteredSales = sales.filter((sale) => {
    const saleTime = sale.date.seconds * 1000;

    const customerMatch =
      customerSearch === "" ||
      sale.customerName.toLowerCase().includes(customerSearch.toLowerCase());

    const totalMatch =
      totalSearch === "" || String(sale.totalAmount).includes(totalSearch);

    const paidMatch =
      paidSearch === "" || String(sale.paidAmount).includes(paidSearch);

    const balanceMatch =
      balanceSearch === "" || String(sale.balanceAdded).includes(balanceSearch);

    const fromMatch =
      !fromDate ||
      saleTime >= new Date(fromDate.setHours(0, 0, 0, 0)).getTime();

    const toMatch =
      !toDate ||
      saleTime <= new Date(toDate.setHours(23, 59, 59, 999)).getTime();

    return (
      customerMatch &&
      totalMatch &&
      paidMatch &&
      balanceMatch &&
      fromMatch &&
      toMatch
    );
  });

  /* -------- UI -------- */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>View Sales</Text>

      {/* SEARCH INPUTS */}
      <View style={styles.searchContainer}>
      <TextInput
        placeholder="Customer Name"
        value={customerSearch}
        onChangeText={setCustomerSearch}
        style={styles.input}
        placeholderTextColor={colors.placeholder}
      />

      <TextInput
        placeholder="Total Amount"
        value={totalSearch}
        onChangeText={setTotalSearch}
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor={colors.placeholder}
      />

      <TextInput
        placeholder="Balance"
        value={balanceSearch}
        onChangeText={setBalanceSearch}
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor={colors.placeholder}
      />

      <TextInput
        placeholder="Paid Amount"
        value={paidSearch}
        onChangeText={setPaidSearch}
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor={colors.placeholder}
      />


      </View>

      {/* DATE FILTER ROW */}
      <View style={styles.dateContainer}>
        <Pressable
          style={styles.dateBtn}
          onPress={() => setShowFromPicker(true)}
        >
          <Text style={styles.dateBtnText}>
            {fromDate ? `From: ${fromDate.toLocaleDateString()}` : "From"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.dateBtn}
          onPress={() => setShowToPicker(true)}
        >
          <Text style={styles.dateBtnText}>
            {toDate ? `To: ${toDate.toLocaleDateString()}` : "To"}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.dateBtn, styles.clearBtn]}
          onPress={() => {
            setFromDate(null);
            setToDate(null);
          }}
        >
          <Text style={styles.clearBtnText}>Clear</Text>
        </Pressable>
      </View>

      {/* SALES LIST */}
      <FlatList
        data={filteredSales}
        keyExtractor={(item) => item.id!}
        ListEmptyComponent={
          <Text style={styles.noData}>No matching sales found</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text>Date: {new Date(item.date.seconds * 1000).toLocaleDateString()}</Text>
            <Text>Total: Rs.{item.totalAmount}</Text>
            <Text>Paid: Rs.{item.paidAmount}</Text>
            <Text>Balance: Rs.{item.balanceAdded}</Text>

            <Text style={styles.editLabel}>Edit Paid Amount</Text>
            <TextInput
              defaultValue={String(item.paidAmount)}
              keyboardType="numeric"
              style={styles.editInput}
              onSubmitEditing={(e) =>
                updatePaid(item.id!, Number(e.nativeEvent.text))
              }
              placeholderTextColor={colors.placeholder}
            />
          </View>
        )}
      />

      {/* MODAL DATE PICKERS */}
      <DateTimePickerModal
        isVisible={showFromPicker}
        mode="date"
        onConfirm={(date) => {
          setFromDate(date);
          setShowFromPicker(false);
        }}
        onCancel={() => {setShowFromPicker(false)
                        setFromDate(null);  
        }}
        accentColor={colors.accent}
      />

      <DateTimePickerModal
        isVisible={showToPicker}
        mode="date"
        onConfirm={(date) => {
          setToDate(date);
          setShowToPicker(false);
        }}
        onCancel={() => {setShowToPicker(false)
                        setToDate(null); }}
        accentColor={colors.accent}
      />
    </View>
  );
}

/* -------- STYLES -------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: colors.background,
    paddingTop: 45,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 15,
    color: colors.error,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 10,
    borderRadius: 8,
    minWidth: 140,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginVertical: 10,
  },
  dateBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  dateBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  clearBtn: {
    backgroundColor: colors.error,
  },
  clearBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  card: {
    borderRadius: 12,
    padding: 15,
    marginVertical: 5,
    backgroundColor: colors.surface,
    elevation: 3,
  },
  customerName: {
    fontWeight: "900",
    fontSize: 16,
    color: colors.accent,
    marginBottom: 5,
  },
  editLabel: {
    marginTop: 10,
    fontWeight: "600",
    color: colors.text,
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 8,
    marginTop: 5,
    backgroundColor: colors.accent + "30",
    color: colors.text,
  },
  noData: {
    textAlign: "center",
    marginTop: 20,
    color: colors.placeholder,
  },
  searchContainer: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,   
  },
});
