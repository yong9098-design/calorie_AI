// ═══════════════════════════════════════════
//  전역 상태
// ═══════════════════════════════════════════
let runtimeConfig = null;
let sbClient = null;
let currentUser = null;
let appInitError = '';
let profile = { daily_calorie_goal:2000, protein_goal:150, carb_goal:250, fat_goal:65, gemini_model:'flash' };
let currentMealType = 'breakfast';
let currentEditMealId = null;
let currentReanalyzeMeal = null;
let historyDate = new Date();
let currentBase64 = null;
let currentImageMime = 'image/jpeg';
let currentStatsMode = 'week';
let currentStep = 1;

const LOCAL_API_ORIGIN = 'http://127.0.0.1:3000';
const GUEST_SESSION_KEY = 'guest_session';
const GUEST_PROFILE_KEY = 'guest_profile';
const GUEST_MEALS_KEY = 'guest_meals';
const onb = { gender:null, age:null, height:null, weight:null, activity:null, actMult:1.2, goal:null };
const MEAL_ICON = { breakfast:'🍳', lunch:'🍱', dinner:'🍽️', snack:'🍪' };
const MEAL_LABEL = { breakfast:'아침', lunch:'점심', dinner:'저녁', snack:'간식' };
