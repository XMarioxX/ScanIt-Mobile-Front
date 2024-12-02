import React from 'react';
import { View, Text } from 'react-native';
import BarcodeBase from 'react-native-barcode-svg';
import tw from 'twrnc';

// Creamos un wrapper del componente Barcode que no use defaultProps
const Barcode = ({
  value,
  format = 'CODE128',
  singleBarWidth = 2,
  maxWidth,
  height = 100,
  lineColor = '#000000',
  backgroundColor = '#FFFFFF',
  onError,
  ...props
}: {
  value: string;
  format?: string;
  singleBarWidth?: number;
  maxWidth?: number;
  height?: number;
  lineColor?: string;
  backgroundColor?: string;
  onError?: (error: any) => void;
}) => (
  <BarcodeBase
    value={value}
    format={format}
    singleBarWidth={singleBarWidth}
    maxWidth={maxWidth}
    height={height}
    lineColor={lineColor}
    backgroundColor={backgroundColor}
    onError={onError}
    {...props}
  />
);

interface BarcodeGeneratorProps {
  value: string;
  showText?: boolean;
  format?: string;
  singleBarWidth?: number;
  maxWidth?: number;
  height?: number;
  lineColor?: string;
  backgroundColor?: string;
  onError?: (error: any) => void;
}

const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({
  value,
  showText = true,
  ...barcodeProps
}) => {
  if (!value) return null;

  return (
    <View style={tw`items-center justify-center`}>
      <Barcode 
        value={value}
        {...barcodeProps}
      />
      {showText && (
        <Text style={tw`mt-2 text-base text-center`}>{value}</Text>
      )}
    </View>
  );
};

export default BarcodeGenerator;