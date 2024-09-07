import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Animated, SafeAreaView, Modal, TouchableWithoutFeedback,Switch  } from 'react-native';
import { Appbar, IconButton } from 'react-native-paper';

const HomeScreen = () => {
  const [input1, setInput1] = useState(''); 
  const [input2, setInput2] = useState(''); 
  const [history, setHistory] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const historyAnim = useRef(new Animated.Value(500)).current; 
  const [isResultDisplayed, setIsResultDisplayed] = useState(false); 
  const [previousInput2, setPreviousInput2] = useState<string>(''); 
  const [isTemperatureMode, setIsTemperatureMode] = useState(false);
  


  const handleModeToggle = () => {
    setIsTemperatureMode(prevMode => !prevMode);
  };

  const handlePress = (value: string) => {
  if (['1/x', 'x²', 'x³', '√x'].includes(value)) {
    let number = parseFloat(isResultDisplayed ? input2 : input1);

    if (isNaN(number)) return;

    switch (value) {
      case '1/x':
        if (number === 0) {
          setInput2('Error');
          return;
        }
        setInput1(`1 / (${input1 || input2})`);
        setInput2((1 / number).toString());
        break;
      case 'x²':
        number = Math.pow(number, 2);
        setInput1(`${input1 || input2}²`);
        setInput2(number.toString());
        break;
      case 'x³':
        number = Math.pow(number, 3);
        setInput1(`${input1 || input2}³`);
        setInput2(number.toString());
        break;
      case '√x':
        if (number < 0) {
          setInput2('Error');
          return;
        }
        number = Math.sqrt(number);
        setInput1(`√(${input1 || input2})`);
        setInput2(number.toString());
        break;
    }

    setIsResultDisplayed(true);
    setPreviousInput2(number.toString());
  } else if (value === '±') {
    setInput1(prevInput => {
      if (!prevInput) return prevInput;
      return prevInput.startsWith('-') ? prevInput.substring(1) : '-' + prevInput;
    });
  } else if (value === '%') {
    const number = parseFloat(isResultDisplayed ? input2 : input1);
    if (isNaN(number)) return;

    let result;
    if (previousInput2 === '') {
      result = (number / 100).toString();
    } else {
      result = (parseFloat(previousInput2) * (number / 100)).toString();
    }

    setInput1(`${input1 || input2} %`);
    setInput2(result);
    setIsResultDisplayed(true);
    setPreviousInput2(result);
  } else if (['+', '-', '*', '÷'].includes(value)) {
    setInput1(prevInput => {
      const lastChar = prevInput.trim().slice(-1);
      const operators = ['+', '-', '*', '÷'];

      if (operators.includes(lastChar)) {
        const numberMatch = prevInput.match(/[\d.]+$/);
        const lastNumber = numberMatch ? numberMatch[0] : '0';
        return prevInput + lastNumber + ` ${value} `;
      } else {
        return prevInput + ` ${value} `;
      }
    });
    setIsResultDisplayed(false);
    setPreviousInput2('');
  } else {
    setInput1(prevInput => {
      setIsResultDisplayed(false);
      setPreviousInput2('');
      return prevInput + value;
    });
  }
  };

  const calculate = () => {
  try {
    let expression = input1;
    
    if (!expression) {
      setInput2(''); 
      return; 
    }

    let calculationExpression = expression
      .replace(/ ÷ /g, '/')
      .replace(/ \* /g, '*') 
      .replace(/²/g, '**2')
      .replace(/³/g, '**3')
      .replace('√', 'Math.sqrt')
      .replace(/×/g, '*');

    // Kiểm tra nếu biểu thức kết thúc bằng một toán tử
    const operators = ['+', '-', '*', '/'];
    const lastChar = calculationExpression.trim().slice(-1);

    if (operators.includes(lastChar)) {
      // Thêm số cuối cùng để hoàn thành biểu thức
      const numberMatch = calculationExpression.match(/[\d.]+/g);
      const lastNumber = numberMatch ? numberMatch[numberMatch.length - 1] : '0';
      calculationExpression += lastNumber;
      expression += `${lastNumber}`; // Cập nhật biểu thức hiển thị
    }

    // Đánh giá kết quả của biểu thức
    const result = eval(calculationExpression).toString();

    // Cập nhật input1 với biểu thức hoàn chỉnh
    setInput1(expression);

    // Cập nhật input2 với kết quả
    setInput2(result);
    updateHistory(`${expression} = ${result}`);

    // Cập nhật previousInput2 để tiếp tục với kết quả mới nếu cần
    setPreviousInput2(result);
    setIsResultDisplayed(true);

  } catch (e) {
    setInput2('Error');
  }
  };
 
  const updateHistory = (entry: string) => {
    setHistory(prevHistory => [...prevHistory, entry]);
  };

  const clearInput = () => {
    setInput1('');
    setInput2('');
    setIsResultDisplayed(false);
    setPreviousInput2(''); 
  };

  const deleteLastCharacter = () => {
    setInput1(prevInput => prevInput.slice(0, -1));
  };

  const toggleHistory = () => {
    if (showHistory) {
      Animated.timing(historyAnim, {
        toValue: -300, 
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowHistory(false));
    } else {
      setShowHistory(true);
      Animated.timing(historyAnim, {
        toValue: 0, 
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const getDynamicFontSize = (input: string) => {
    if (input.length > 15) {
      return 24; 
    } else if (input.length > 10) {
      return 30; 
    } else {
      return 36; 
    }
  };

  const handleOutsidePress = () => {
    if (showHistory) {
      Animated.timing(historyAnim, {
        toValue: -300, 
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowHistory(false));
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const buttonRows = [
    ['%', 'C', 'DEL', '1/x'],
    ['√x', 'x²', 'x³', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['±', '0', '.', '=']
  ];

  const renderButton = (item: string, index: number) => {
    let onPress: () => void;
  
    switch (item) {
      case 'C':
        onPress = clearInput;
        break;
      case 'DEL':
        onPress = deleteLastCharacter;
        break;
      case '=':
        onPress = calculate;
        break;
      default:
        onPress = () => handlePress(item);
    }
  
    const isNumberButton = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '±'].includes(item);
    const isEqualButton = item === '=';
  
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.button,
          darkMode ? styles.darkButton : styles.lightButton, 
          isEqualButton && styles.equalButton 
        ]}
        onPress={onPress}
      >
        <Text style={[
          styles.buttonText,
          darkMode ? styles.darkButtonText : styles.lightButtonText, 
          isEqualButton && styles.equalButtonText 
        ]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };
  

  return (
    <SafeAreaView style={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]}>
      <Appbar.Header>
      <IconButton 
            icon={isTemperatureMode ? "thermometer" : "calculator"} 
            size={30} 
            onPress={handleModeToggle} 
            style={{ marginLeft: 20 }}  
          />
        <Appbar.Content title={isTemperatureMode ? "Temperature" : "Calculator"} titleStyle={{ fontSize: 26, fontWeight: 'bold', letterSpacing: 1,marginRight: 50 }} /> 
        <Appbar.Action icon="history" onPress={toggleHistory} />
        <Appbar.Action icon={darkMode ? "brightness-7" : "brightness-4"} onPress={toggleDarkMode} />
      </Appbar.Header>
      <View style={styles.mainContainer}>
        {isTemperatureMode ? (
         <TemperatureConversion darkMode={darkMode} />// Hiển thị thành phần chuyển đổi nhiệt độ khi ở chế độ chuyển đổi nhiệt độ
        ) : (
          <>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  darkMode ? styles.darkInput : styles.lightInput,
                  { fontSize: getDynamicFontSize(input1) } 
                ]}
                value={input1}
                onChangeText={setInput1}
                placeholder=""
                keyboardType="numeric"
                editable={false}
              />
              <TextInput
                style={[
                  styles.input2,
                  darkMode ? styles.darkInput : styles.lightInput,
                  { fontSize: getDynamicFontSize(input2) } 
                ]}
                value={input2}
                placeholder=""
                keyboardType="numeric"
                editable={false}
              />
            </View>
            <View style={styles.buttonContainer}>
              <View style={styles.buttonGrid}>
                {buttonRows.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.buttonRow}>
                    {row.map((item, itemIndex) => renderButton(item, itemIndex))}
                  </View>
                ))}
              </View>
            </View>
            <Modal
              transparent={true}
              visible={showHistory}
              onRequestClose={handleOutsidePress}
              animationType="none"
            >
              <TouchableWithoutFeedback onPress={handleOutsidePress}>
                <View style={styles.overlay}>
                  <Animated.View style={[styles.historyContainer, { transform: [{ translateY: historyAnim }] }]}>
                    {history.length === 0 ? (
                      <Text style={styles.emptyHistoryText}>No history available</Text>
                    ) : (
                      <FlatList
                        data={history}
                        renderItem={({ item }) => (
                          <View style={styles.historyItem}>
                            <Text style={styles.historyText}>{item}</Text>
                          </View>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                      />
                    )}
                  </Animated.View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};


const TemperatureConversion = ({ darkMode }: { darkMode: boolean }) => {
  const [temperature, setTemperature] = useState('');
  const [convertedTemperature, setConvertedTemperature] = useState('');
  const [conversionType, setConversionType] = useState<'CtoF' | 'FtoC'>('CtoF');

  const handleConvert = () => {
    const value = parseFloat(temperature);

    if (isNaN(value)) {
      setConvertedTemperature('Empty!');
      return;
    }

    let result: string;

    if (conversionType === 'CtoF') {
      result = ((value * 9/5) + 32).toFixed(2) + ' °F';
    } else {
      result = ((value - 32) * 5/9).toFixed(2) + ' °C';
    }

    setConvertedTemperature(result);
  };

  return (
    <View style={[styles.tempContainer, darkMode ? styles.darkTempContainer : styles.lightTempContainer]}>
      <TextInput
        style={[styles.tempInput, darkMode ? styles.darkTempInput : styles.lightTempInput]}
        value={temperature}
        onChangeText={setTemperature}
        placeholder="Enter temperature"
        keyboardType="numeric"
      />
      <TouchableOpacity
        style={styles.convertButton}
        onPress={handleConvert}
      >
        <Text style={styles.convertButtonText}>Convert</Text>
      </TouchableOpacity>
      <Text style={[styles.convertedTemperature, darkMode ? styles.darkConvertedTemperature : styles.lightConvertedTemperature]}>
        {convertedTemperature}
      </Text>
      <View style={styles.switchContainer}>
        <Text>C to F</Text>
        <Switch
          value={conversionType === 'FtoC'}
          onValueChange={() => setConversionType(prev => (prev === 'CtoF' ? 'FtoC' : 'CtoF'))}
        />
        <Text>F to C</Text>
      </View>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    bottom: 40,
  },
  darkContainer: {
    backgroundColor: '#222222', 
  },
  lightContainer: {
    backgroundColor: '#fff',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    bottom: 10,
  },
  inputContainer: {
    padding: 20,
    marginBottom: 40, 
  },
  input: {
    height: 80,
    fontSize: 36,
    textAlign: 'right',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10, 
  },
  input2: {
    height: 60,
    fontSize: 28,
    textAlign: 'right',
    padding: 10,
    borderRadius: 10,
  },
  darkInput: {
    backgroundColor: '#444444', 
    color: '#e0e0e0', 
  },
  lightInput: {
    backgroundColor: '#f0f0f0', 
    color: '#000', 
  },
  buttonContainer: {
    paddingBottom: 14, 
    paddingHorizontal: 10, 
  },
  buttonGrid: {
    flexDirection: 'column',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: '#444', 
    borderRadius: 10,
  },
  darkButton: {
    backgroundColor: '#444444', 
  },
  lightButton: {
    backgroundColor: '#e0e0e0', 
  },
  buttonText: {
    fontSize: 20,
  },
  darkButtonText: {
    color: '#fff', 
  },
  lightButtonText: {
    color: '#333', 
  },
  equalButton: {
    backgroundColor: '#007bff', 
  },
  equalButtonText: {
    color: '#fff', 
  },
  defaultButtonText: {
    color: '#333', 
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  historyContainer: {
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: '#666', 
    maxHeight: '40%',
    overflow: 'hidden',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#666', 
  },
  historyText: {
    fontSize: 16,
    color: '#000000', 
  },
  emptyHistoryText: {
    textAlign: 'center',
    padding: 20,
    color: '#888', 
  },
  tempContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 120,
  },
  darkTempContainer: {
    backgroundColor: '#555555', 
  },
  lightTempContainer: {
    backgroundColor: '#fff', 
  },
  tempInput: {
    height: 50,
    width: '80%',
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  darkTempInput: {
    backgroundColor: '#888888', 
    color: '#eee', 
  },
  lightTempInput: {
    backgroundColor: '#f0f0f0',  
    color: '#000', 
  },
  convertButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 20,
  },
  convertButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  convertedTemperature: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  darkConvertedTemperature: {
    color: '#eee', 
  },
  lightConvertedTemperature: {
    color: '#000', 
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '60%',
  },
});



export default HomeScreen;
