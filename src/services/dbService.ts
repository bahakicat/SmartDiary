import { supabase } from '../lib/supabase';
import { AnalysisResult, AppSettings, CalendarEvent } from '../types';

export const dbService = {
  async loadSettings(userId: string): Promise<AppSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('settings_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) console.error('Error loading settings:', error);
    return data?.settings_data as AppSettings | null;
  },

  async saveSettings(userId: string, settings: AppSettings) {
    const { error } = await supabase
      .from('user_settings')
      .insert({ user_id: userId, settings_data: settings });
    if (error) console.error('Error saving settings:', error);
  },

  async loadHistory(userId: string): Promise<AnalysisResult[]> {
    const { data, error } = await supabase
      .from('analysis_requests')
      .select(`
        id,
        text_input,
        created_at,
        emotion_results (
          emotions_data
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading history:', error);
      return [];
    }

    return (data || []).map((row: any) => {
      const emotionsData = row.emotion_results?.[0]?.emotions_data || {};
      return {
        id: row.id,
        text: row.text_input,
        created_at: row.created_at,
        ...emotionsData
      } as AnalysisResult;
    });
  },

  async saveAnalysisResult(userId: string, result: AnalysisResult) {
    // 1. Insert into analysis_requests
    const { data: requestData, error: requestError } = await supabase
      .from('analysis_requests')
      .insert({
        id: result.id, // Use the same ID
        user_id: userId,
        text_input: result.text,
        created_at: result.created_at
      })
      .select('id')
      .single();

    if (requestError) {
      console.error('Error saving analysis request:', requestError);
      return;
    }

    const requestId = requestData.id;

    // Extract emotions data (everything except id, text, created_at)
    const { id, text, created_at, ...emotionsData } = result;

    // 2. Insert into emotion_results
    const { error: emotionError } = await supabase
      .from('emotion_results')
      .insert({
        request_id: requestId,
        user_id: userId,
        emotions_data: emotionsData
      });

    if (emotionError) console.error('Error saving emotion results:', emotionError);

    // 3. Insert into ai_models_log
    const { error: logError } = await supabase
      .from('ai_models_log')
      .insert({
        request_id: requestId,
        model_name: 'gemini-3-flash-preview',
        status: 'success'
      });

    if (logError) console.error('Error saving ai log:', logError);
  },

  async updateFavoriteStatus(userId: string, requestId: string, isFavorite: boolean) {
    const { data, error } = await supabase
      .from('emotion_results')
      .select('id, emotions_data')
      .eq('request_id', requestId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching emotion result for update:', error);
      return;
    }

    const updatedData = { ...data.emotions_data, is_favorite: isFavorite };

    const { error: updateError } = await supabase
      .from('emotion_results')
      .update({ emotions_data: updatedData })
      .eq('id', data.id);

    if (updateError) console.error('Error updating favorite status:', updateError);
  }
};
