from .models import User
from django import forms


class SignUpForm(forms.ModelForm):
    password = forms.CharField(widget= forms.PasswordInput)
    confirm_password = forms.CharField(widget= forms.PasswordInput)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        
    def clean(self):
        cleaned_data = super(SignUpForm, self).clean()
        password = cleaned_data.get('password')
        confirm_password = cleaned_data.get('confirm_password')
        
        if password != confirm_password:
            self.add_error('confirm_password', 'Passwords do not match')
        
        return cleaned_data
    
