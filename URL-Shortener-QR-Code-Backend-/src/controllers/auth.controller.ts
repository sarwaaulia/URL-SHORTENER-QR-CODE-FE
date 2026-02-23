import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { createClient } from '@supabase/supabase-js';

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Sign up user with normal Supabase client (anon/public key)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      return res.status(400).json({ error: signUpError.message });
    }

    if (!signUpData.user) {
      return res.status(500).json({ error: 'User creation failed' });
    }

    // Insert profile using service role client to bypass RLS
    const serviceSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: profileError } = await serviceSupabase
      .from('profiles')
      .insert({
        id: signUpData.user.id,
        email,
      });

    if (profileError) {
      return res.status(500).json({ error: profileError.message });
    }

    // Return success
    return res.json({
      message: 'Register success',
      user: signUpData.user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session || !data.user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  return res.json({
    access_token: data.session.access_token,
    user: data.user,
  });
};
