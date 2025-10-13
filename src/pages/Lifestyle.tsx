import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, ShoppingCart, DollarSign, Bus, ArrowRight } from 'lucide-react';
import { deals, productComparisons, currencyRates } from '../data/mockData';

export default function Lifestyle() {
  const [searchProduct, setSearchProduct] = useState('');
  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('1000'); // Example: 1000 INR as default
  const [transportFrom, setTransportFrom] = useState('');
  const [transportTo, setTransportTo] = useState('');

  const filteredProducts = searchProduct
    ? productComparisons.filter(p => p.product.toLowerCase().includes(searchProduct.toLowerCase()))
    : productComparisons;

  const convertCurrency = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt)) return 0;
    const fromRate = currencyRates[fromCurrency];
    const toRate = currencyRates[toCurrency];
    return ((amt / fromRate) * toRate).toFixed(2);
  };

  const transportOptions = transportFrom && transportTo ? [
    { mode: 'Bus', cost: 5, time: '10 min', savings: 10 },
    { mode: 'Subway', cost: 3.50, time: '8 min', savings: 11.50 },
    { mode: 'Uber', cost: 15, time: '6 min', savings: 0 },
    { mode: 'Walk', cost: 0, time: '25 min', savings: 15 }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Smart Lifestyle</h1>
        <p className="text-gray-600 dark:text-gray-400">Save money with smart shopping and cost-effective choices</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
              <ShoppingCart className="text-green-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Smart Shopping Advisor</h3>
          </div>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                placeholder="Search for products (e.g., iPhone, Laptop)"
                className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-green-500 dark:text-white"
              />
            </div>
          </div>
          <div className="space-y-3">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">{product.product}</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Amazon</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {fromCurrency === 'INR' ? '₹' : fromCurrency === 'USD' ? '$' : fromCurrency + ' '}
                      {product.amazon}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Flipkart</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {fromCurrency === 'INR' ? '₹' : fromCurrency === 'USD' ? '$' : fromCurrency + ' '}
                      {product.flipkart}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Best Buy</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {fromCurrency === 'INR' ? '₹' : fromCurrency === 'USD' ? '$' : fromCurrency + ' '}
                      {product.bestbuy}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Best: {fromCurrency === 'INR' ? '₹' : fromCurrency === 'USD' ? '$' : fromCurrency + ' '}
                    {Math.min(product.amazon, product.flipkart, product.bestbuy)}
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                    {product.cashback} Cashback
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <MapPin className="text-blue-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Local Deals Nearby</h3>
          </div>
          <div className="space-y-3 mb-6">
            {deals.map((deal) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * deal.id }}
                className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-l-4 border-green-500"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{deal.store}</h4>
                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold">{deal.discount}</p>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{deal.distance}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin size={14} />
                  <span>{deal.location}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Location</span>
            </div>
            <input
              type="text"
              placeholder="Enter your location for more deals"
              className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
              <Bus className="text-purple-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Transportation Optimizer</h3>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From</label>
              <input
                type="text"
                value={transportFrom}
                onChange={(e) => setTransportFrom(e.target.value)}
                placeholder="Starting location"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To</label>
              <input
                type="text"
                value={transportTo}
                onChange={(e) => setTransportTo(e.target.value)}
                placeholder="Destination"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          {transportOptions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3"
            >
              {transportOptions.map((option, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{option.mode}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{option.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {toCurrency === 'INR' ? '₹' : toCurrency === 'USD' ? '$' : toCurrency + ' '}
                      {option.cost.toFixed(2)}
                    </p>
                    {option.savings > 0 && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Save {toCurrency === 'INR' ? '₹' : toCurrency === 'USD' ? '$' : toCurrency + ' '}
                        {option.savings.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
              <DollarSign className="text-orange-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Currency Converter</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                >
                  {Object.keys(currencyRates).map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                >
                  {Object.keys(currencyRates).map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Converted Amount</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{amount} {fromCurrency}</span>
                <ArrowRight className="text-orange-600" size={24} />
                <span className="text-3xl font-bold text-orange-600">{convertCurrency()} {toCurrency}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Rate: 1 {fromCurrency} = {((currencyRates[toCurrency] / currencyRates[fromCurrency]).toFixed(4))} {toCurrency}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
