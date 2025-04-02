
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';

interface DailyNutritionData {
  date: string;
  total_calories: number;
  total_proteins: number;
  total_carbs: number;
  total_fats: number;
  total_fiber: number | null;
}

const DailyNutrition = () => {
  const [nutritionData, setNutritionData] = useState<DailyNutritionData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);

  // Recommended daily values (RDV) for an average adult
  const rdv = {
    calories: 2000,
    proteins: 50,
    carbs: 300,
    fats: 70,
    fiber: 25
  };

  useEffect(() => {
    const fetchDailyNutrition = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('daily_nutrition')
          .select('*')
          .eq('date', selectedDate)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw error;
        }

        setNutritionData(data || {
          date: selectedDate,
          total_calories: 0,
          total_proteins: 0,
          total_carbs: 0,
          total_fats: 0,
          total_fiber: 0
        });
      } catch (error) {
        console.error('Error fetching daily nutrition:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyNutrition();
  }, [selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const getPercentOfRDV = (value: number | null, rdvValue: number) => {
    if (value === null) return 0;
    return Math.round((value / rdvValue) * 100);
  };

  const getNutrientStatus = (percent: number) => {
    if (percent >= 90) return { color: 'bg-green-500', text: 'Excellent' };
    if (percent >= 60) return { color: 'bg-green-300', text: 'Good' };
    if (percent >= 30) return { color: 'bg-yellow-400', text: 'Moderate' };
    return { color: 'bg-red-500', text: 'Low' };
  };

  const chartData = nutritionData ? [
    { name: 'Proteins', current: nutritionData.total_proteins || 0, recommended: rdv.proteins },
    { name: 'Carbs', current: nutritionData.total_carbs || 0, recommended: rdv.carbs },
    { name: 'Fats', current: nutritionData.total_fats || 0, recommended: rdv.fats },
    { name: 'Fiber', current: nutritionData.total_fiber || 0, recommended: rdv.fiber }
  ] : [];

  const nutrients = [
    { name: 'Calories', value: nutritionData?.total_calories || 0, unit: 'kcal', rdv: rdv.calories },
    { name: 'Proteins', value: nutritionData?.total_proteins || 0, unit: 'g', rdv: rdv.proteins },
    { name: 'Carbs', value: nutritionData?.total_carbs || 0, unit: 'g', rdv: rdv.carbs },
    { name: 'Fats', value: nutritionData?.total_fats || 0, unit: 'g', rdv: rdv.fats },
    { name: 'Fiber', value: nutritionData?.total_fiber || 0, unit: 'g', rdv: rdv.fiber }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold">Daily Nutrition Summary</h2>
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="w-auto"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p>Loading nutrition data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {nutrients.map((nutrient, index) => {
              const percent = getPercentOfRDV(nutrient.value, nutrient.rdv);
              const status = getNutrientStatus(percent);
              return (
                <Card key={index}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {nutrient.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-1">
                    <div className="text-2xl font-bold mb-1">
                      {nutrient.value} {nutrient.unit}
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5 mb-1">
                      <div 
                        className={`h-2.5 rounded-full ${status.color}`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{status.text}</span>
                      <span className="font-medium">{percent}% of goal</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar name="Consumed" dataKey="current" fill="#3b82f6" />
                    <Bar name="Recommended" dataKey="recommended" fill="#94a3b8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DailyNutrition;
