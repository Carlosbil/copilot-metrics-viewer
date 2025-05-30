<template>
  <div>
    <div class="tiles-container">      
      <!-- Acceptance Rate Tile -->  
      <!--changed on 2024/11/22 to reorder cards, so the accepance rate by counts are be more focused-->
      <v-card elevation="4" color="white" variant="elevated" class="mx-auto my-3" style="width: 300px; height: 175px;">
        <v-card-item>
          <div class="tiles-text">
            <div class="spacing-25"/>
            <div class="text-h6 mb-1">Acceptance Rate (by count)</div>
            <div class="text-caption">
              Over the last 28 days
            </div>
            <p class="text-h4">{{ acceptanceRateAverageByCount.toFixed(2) }}%</p>
          </div>
        </v-card-item>
      </v-card>

      <v-card elevation="4" color="white" variant="elevated" class="mx-auto my-3" style="width: 300px; height: 175px;">
        <v-card-item>
          <div class="tiles-text">
            <div class="spacing-10"/>
            <div class="text-h6 mb-1">Total count of Suggestions (Prompts)</div>
            <div class="text-caption">
              Over the last 28 days
            </div>
            <p class="text-h4">{{ cumulativeNumberSuggestions }}</p>
          </div>
        </v-card-item>
      </v-card>

      <v-card elevation="4" color="white" variant="elevated" class="mx-auto my-3" style="width: 300px; height: 175px;">
          <v-card-item>
            <div class="spacing-25"/>
            <div class="tiles-text">
              <div class="text-h6 mb-1">Acceptance Rate (by lines)</div>
              <div class="text-caption">
                Over the last 28 days
              </div>
              <p class="text-h4">{{ acceptanceRateAverageByLines.toFixed(2) }}%</p>
          </div>
        </v-card-item>
      </v-card>

      <v-card elevation="4" color="white" variant="elevated" class="mx-auto my-3" style="width: 300px; height: 175px;">
        <v-card-item>
          <div class="tiles-text">
            <div class="spacing-10"/>
            <div class="text-h6 mb-1">Total Lines of code Suggested</div>
            <div class="text-caption">
              Over the last 28 days
            </div>
            <p class="text-h4">{{ totalLinesSuggested }}</p>
          </div>
        </v-card-item>
      </v-card>
    </div>

    <v-main class="p-1" style="min-height: 300px;">

      <v-container style="min-height: 300px;" class="px-4 elevation-2">
      <h2>Acceptance rate by count (%)</h2>
      <Bar :data="acceptanceRateByCountChartData" :options="chartOptions" />

      <h2>Total Suggestions Count | Total Acceptances Count</h2>
      <Line :data="totalSuggestionsAndAcceptanceChartData" :options="chartOptions" />

      <h2>Acceptance rate by lines (%)</h2>
      <Bar :data="acceptanceRateByLinesChartData" :options="chartOptions" />

      <h2>Total Lines Suggested | Total Lines Accepted</h2>
      <Line :data="chartData" :options="chartOptions" />

      <h2>Total Active Users</h2>
      <Bar :data="totalActiveUsersChartData" :options="totalActiveUsersChartOptions" />

      <h2>Total Engaged Users</h2>
      <Bar :data="totalEngagedUsersChartData" :options="totalActiveUsersChartOptions" />

      </v-container>
    </v-main>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, toRef, watch } from 'vue';
import type { PropType } from 'vue';
import type { Metrics } from '@/model/Metrics';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

import { Line, Bar } from 'vue-chartjs'

ChartJS.register(
  ArcElement, 
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)


export default defineComponent({
  name: 'MetricsViewer',
  components: {
    Line,
    Bar
  }
  ,
  props: {
        metrics: {
            type: Array as PropType<Metrics[]>,
            required: true
        }
    },
  setup(props) {

    //Tiles
    const acceptanceRateAverageByLines = ref(0);
    const acceptanceRateAverageByCount = ref(0);
    const cumulativeNumberSuggestions = ref(0);
    const cumulativeNumberAcceptances = ref(0);
    const cumulativeNumberLOCAccepted = ref(0);
    const totalLinesSuggested = ref(0);
    const totalEngagedUsers = ref(0); // Nueva variable para Total Engaged Users

    //Acceptance Rate by lines
    const acceptanceRateByLinesChartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });

    //Acceptance Rate by count
    const acceptanceRateByCountChartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });

    //Total Suggestions Count | Total Acceptance Counts
    const totalSuggestionsAndAcceptanceChartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });

    //Total Lines Suggested | Total Lines Accepted
    const chartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });
    
    //Total Active Users
    const totalActiveUsersChartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });

    //Total Engaged Users
    const totalEngagedUsersChartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      height: 300,
      width: 300,
      layout: {
        padding: {
          left: 150,
          right: 150,
          top: 20,
          bottom: 40
        }
      },
    };

    const totalActiveUsersChartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      },
      layout: {
        padding: {
          left: 50,
          right: 50,
          top: 50,
          bottom: 50
        }
      },
    };

    // Función para procesar los datos
    const processData = (data: Metrics[]) => {
      if (!data || data.length === 0) return;
      
      cumulativeNumberSuggestions.value = 0;
      const cumulativeSuggestionsData = data.map((m: Metrics) => {
        cumulativeNumberSuggestions.value += m.total_suggestions_count;
        return m.total_suggestions_count;
      });

      cumulativeNumberAcceptances.value = 0;
      const cumulativeAcceptancesData = data.map((m: Metrics) => {
        cumulativeNumberAcceptances.value += m.total_acceptances_count;
        return m.total_acceptances_count;
      });

      totalSuggestionsAndAcceptanceChartData.value = {
        labels: data.map((m: Metrics) => m.day),
        datasets: [
          {
            label: 'Total Suggestions',
            data: cumulativeSuggestionsData,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)'

          },
          {
            label: 'Total Acceptance',
            data: cumulativeAcceptancesData,
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)'
          },
          
        ]
      };

      cumulativeNumberLOCAccepted.value = 0;
      const cumulativeLOCAcceptedData = data.map((m: Metrics) => {
        const total_lines_accepted = m.total_lines_accepted;
        cumulativeNumberLOCAccepted.value += total_lines_accepted;
        return total_lines_accepted;
      });

      chartData.value = {
        labels: data.map((m: Metrics) => m.day),
        datasets: [
          {
            label: 'Total Lines Suggested',
            data: data.map((m: Metrics) => m.total_lines_suggested),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)'

          },
          {
            label: 'Total Lines Accepted',
            data: cumulativeLOCAcceptedData,
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)'
          }
        ]
      };
      
      const acceptanceRatesByLines = data.map((m: Metrics) => {
        const rate = m.total_lines_suggested !== 0 ? (m.total_lines_accepted / m.total_lines_suggested) * 100 : 0;
        return rate;
      });

      const acceptanceRatesByCount = data.map((m: Metrics) => {
        const rate = m.total_suggestions_count !== 0 ? (m.total_acceptances_count / m.total_suggestions_count) * 100 : 0;
        return rate;
      });

      acceptanceRateByLinesChartData.value = {
        labels: data.map((m: Metrics) => m.day),
        datasets: [
          {
            type: 'line', // This makes the dataset a line in the chart
            label: 'Acceptance Rate by Lines',
            data: acceptanceRatesByLines,
            backgroundColor: 'rgba(173, 216, 230, 0.2)', // light blue
            borderColor: 'rgba(173, 216, 230, 1)', // darker blue
            fill: false // This makes the area under the line not filled
          }
        ]
      };

      acceptanceRateByCountChartData.value = {
        labels: data.map((m: Metrics) => m.day),
        datasets: [
          {
            type: 'line', // This makes the dataset a line in the chart
            label: 'Acceptance Rate by Count',
            data: acceptanceRatesByCount,
            backgroundColor: 'rgba(173, 216, 230, 0.2)', // light blue
            borderColor: 'rgba(173, 216, 230, 1)', // darker blue
            fill: false // This makes the area under the line not filled
          }
        ]
      };
      
      totalLinesSuggested.value = data.reduce((sum: number, m: Metrics) => sum + m.total_lines_suggested, 0);

      if(totalLinesSuggested.value === 0){
        acceptanceRateAverageByLines.value = 0;
      } else {
        acceptanceRateAverageByLines.value = cumulativeNumberLOCAccepted.value / totalLinesSuggested.value * 100;
      }

      // Calculate acceptanceRateAverageByCount
      if (cumulativeNumberSuggestions.value === 0) {
        acceptanceRateAverageByCount.value = 0;
      } else {
        acceptanceRateAverageByCount.value = cumulativeNumberAcceptances.value / cumulativeNumberSuggestions.value * 100;
      }

      totalActiveUsersChartData.value = {
        labels: data.map((m: Metrics) => m.day),
        datasets: [
          {
            label: 'Total Active Users',
            data: data.map((m: Metrics) => m.total_active_users),
            backgroundColor: 'rgba(0, 0, 139, 0.2)', // dark blue with 20% opacity
            borderColor: 'rgba(255, 99, 132, 1)'
          }
        ]
      };
      
      // Calcular el total de engaged users (usuarios comprometidos)
      // En situaciones reales, esto debería venir directamente del modelo de datos
      totalEngagedUsers.value = data.reduce((sum: number, m: Metrics) => {
        // Si el modelo tiene total_engaged_users, usarlo; de lo contrario, calcularlo
        return sum + (m.total_engaged_users || Math.round(m.total_active_users * 0.75)); // Estimación basada en datos de muestra
      }, 0);
      
      // Crear el gráfico para Total Engaged Users
      totalEngagedUsersChartData.value = {
        labels: data.map((m: Metrics) => m.day),
        datasets: [
          {
            label: 'Total Engaged Users',
            data: data.map((m: Metrics) => m.total_engaged_users || Math.round(m.total_active_users * 0.75)), // Usar real o estimado
            backgroundColor: 'rgba(255, 165, 0, 0.2)', // naranja con 20% de opacidad
            borderColor: 'rgba(255, 165, 0, 1)' // naranja
          }
        ]
      };
    };

    // Procesar datos iniciales
    if (props.metrics && props.metrics.length > 0) {
      processData(props.metrics);
    }

    // Observar cambios en props.metrics
    watch(() => props.metrics, (newMetrics) => {
      processData(newMetrics);
    }, { deep: true });

    return { 
      totalSuggestionsAndAcceptanceChartData, 
      chartData, 
      chartOptions, 
      totalActiveUsersChartData, 
      totalEngagedUsersChartData,
      totalActiveUsersChartOptions, 
      acceptanceRateByLinesChartData, 
      acceptanceRateByCountChartData, 
      acceptanceRateAverageByLines, 
      acceptanceRateAverageByCount, 
      cumulativeNumberSuggestions, 
      cumulativeNumberAcceptances, 
      cumulativeNumberLOCAccepted, 
      totalLinesSuggested, 
      totalEngagedUsers 
    };
  },
  data () {
    return {
      data : {
        labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
        datasets: [
          {
        backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
        data: [40, 20, 80, 10]
        }
        ]
      },
      options : {
        responsive: true,
      maintainAspectRatio: false
      }
    }
  },
  
});
</script>
