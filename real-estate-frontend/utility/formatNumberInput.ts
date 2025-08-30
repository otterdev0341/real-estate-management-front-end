const formatNumberInput = (value: string) =>  {
  const num = value.replace(/,/g, "");
  if (num === "") return "";
  return Number(num).toLocaleString();
}

export default formatNumberInput;