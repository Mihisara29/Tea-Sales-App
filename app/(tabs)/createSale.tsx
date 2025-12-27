import { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { useCustomerStore } from "../../stores/customerStore";
import { useProductStore } from "../../stores/productStore";
import { useSalesStore } from "../../stores/salesStore";
import { AuthContext } from "../../context/AuthContext";
import { Timestamp } from "firebase/firestore";
import { colors } from "../theme";


export default function CreateSale() {
  const { user } = useContext(AuthContext);

  const customers = useCustomerStore((state) => state.customers);
  const products = useProductStore((state) => state.products);
  const createSale = useSalesStore((state) => state.createSale);

  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [paidAmount, setPaidAmount] = useState("");
  const fetchCustomers = useCustomerStore((state) => state.fetchCustomers);
  const fetchProducts = useProductStore((state) => state.fetchProducts);

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.productId === product.id);
      if (exist) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.price }
            : i
        );
      }
      return [
        ...prev,
        { productId: product.id, name: product.name, price: product.price, qty: 1, total: product.price },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
  setCart((prev) => prev.filter((item) => item.productId !== productId));
};

  const updateQty = (productId: string, qty: number) => {
    if (qty < 0) return;
    setCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty, total: qty * i.price } : i))
    );
  };

  const totalAmount = cart.reduce((sum, i) => sum + i.total, 0);

  const saveSale = () => {
    if (!selectedCustomer || cart.length === 0 || !paidAmount) {
      alert("Please select customer, products and paid amount");
      return;
    }

    createSale({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      items: cart,
      totalAmount,
      paidAmount: Number(paidAmount),
      balanceAdded: totalAmount - Number(paidAmount),
      createdBy: user?.uid,
      date: Timestamp.now(),
    });

    setSelectedCustomer(null);
    setCart([]);
    setPaidAmount("");
    setCustomerSearch("");
    setProductSearch("");

    alert("Sale created successfully");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Sale</Text>

      <View style={{ position: "relative" }}>
        {/* CUSTOMER SEARCH */}
      <Text style={styles.section}>Customer</Text>
      <TextInput
        placeholder="Search customer by name"
        value={customerSearch}
        onChangeText={(text) => {
          setCustomerSearch(text);
          setSelectedCustomer(null);
        }}
        style={styles.input}
        placeholderTextColor={colors.placeholder}
      />

      {customerSearch.length > 0 && !selectedCustomer && (
        <View style={[styles.dropdown, { zIndex: 2 }]}>
          {customers
            .filter((c) =>
              c.name.toLowerCase().includes(customerSearch.toLowerCase())
            )
            .map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedCustomer(c)}
                style={styles.listItem}
              >
                <Text>{c.name}</Text>
              </TouchableOpacity>
            ))}
        </View>
      )}

      {selectedCustomer && (
        <Text style={styles.selected}>
          Selected Customer: {selectedCustomer.name}
        </Text>
      )}
      </View>

      <View style={{ position: "relative"}}>
        {/* PRODUCT SEARCH */}
<Text style={styles.section}>Products</Text>
<TextInput
  placeholder="Search product"
  value={productSearch}
  onChangeText={(text) => {
    setProductSearch(text);
  }}
  style={styles.input}
  placeholderTextColor={colors.placeholder}
/>

{productSearch.length > 0 && cart.length >= 0 && (
  <View style={[styles.dropdown, { zIndex: 1 }]}>
    {products
      .filter((p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
      )
      .map((p) => (
        <TouchableOpacity
          key={p.id}
          onPress={() => {
            addToCart(p);
            setProductSearch(""); // hide dropdown after selecting
          }}
          style={styles.listItem}
        >
          <Text>
            {p.name} - Rs.{p.price}
          </Text>
        </TouchableOpacity>
      ))}
  </View>
)}

      </View>  

      {/* CART */}
      <Text style={styles.section}>Cart</Text>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Text style={{ flex: 1 }}>{item.name}</Text>

            <TextInput
              value={String(item.qty)}
              keyboardType="numeric"
              style={styles.qtyInput}
              onChangeText={(text) => updateQty(item.productId, Number(text))}
              placeholderTextColor={colors.placeholder}
            />

            <Text>Rs.{item.total}</Text>
              <TouchableOpacity
                onPress={() => removeFromCart(item.productId)}
                style={styles.removeBtn}
              >
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
          </View>
        )}
      />

      <Text style={styles.total}>Total: Rs.{totalAmount}</Text>

      {/* PAID AMOUNT */}
      <TextInput
        placeholder="Paid Amount"
        value={paidAmount}
        keyboardType="numeric"
        onChangeText={setPaidAmount}
        style={styles.input}
        placeholderTextColor={colors.placeholder}
      />

      <Button title="Save Sale" color={colors.primary} onPress={saveSale} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, flex: 1, backgroundColor: colors.background, paddingTop: 45 },
  title: { fontSize: 22, fontWeight: "900", marginBottom: 5, color: colors.error, alignSelf: "center" },
  section: { fontWeight: "bold", marginTop: 10, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    borderRadius: 8,
    marginVertical: 2,
    backgroundColor: colors.surface,
  },
  selected: {
    color: colors.accent,
    marginVertical: 5,
    fontWeight: "600",
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginVertical: 2,
    paddingHorizontal: 5,
  },
  qtyInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    width: 60,
    textAlign: "center",
    marginHorizontal: 5,
    borderRadius: 8,
    padding: 5,
    color: colors.text,
    backgroundColor: "#FAFAFA",
  },
  total: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
    color: colors.text,
  },
  dropdown: {
  width: "100%",
  position: "absolute",
  top: 70,
  zIndex: 100,
  backgroundColor: colors.surface,
  borderRadius: 8,
  maxHeight: 150,
  borderWidth: 1,
  borderColor: "#DDD",
  marginTop: 5,
  elevation: 5, // for shadow in Android
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
},

removeBtn: {
  marginLeft: 8,
  backgroundColor: colors.error,
  width: 28,
  height: 28,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
},

removeText: {
  color: "#fff",
  fontWeight: "900",
  fontSize: 14,
},


});
