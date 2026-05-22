<?php

namespace App\Notifications;

use App\Models\Partner;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class PartnerRegistered extends Notification implements ShouldQueue
{
    use Queueable;

    protected Partner $partner;
    protected string $password;

    /**
     * Create a new notification instance.
     */
    public function __construct(Partner $partner, string $password)
    {
        $this->partner = $partner;
        $this->password = $password;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Welcome to Kitui County GBV Information System')
            ->greeting('Dear ' . $this->partner->contact_person . ',')
            ->line('Thank you for registering your organization with the Kitui County GBV Information System.')
            ->line('**Organization:** ' . $this->partner->organization_name)
            ->line('**Registration Status:** Pending Approval')
            ->line('Your registration has been received and is currently under review by our administrators.')
            ->line('You will receive another email once your account has been approved.')
            ->line('In the meantime, here are your login credentials:')
            ->line('**Email:** ' . $this->partner->email)
            ->line('**Password:** ' . $this->password)
            ->action('Login to Your Account', route('login'))
            ->line('For security reasons, please change your password after first login.')
            ->line('If you have any questions, please contact our support team.')
            ->line('Thank you for partnering with us to end GBV in Kitui County!');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray($notifiable): array
    {
        return [
            'partner_id' => $this->partner->id,
            'organization_name' => $this->partner->organization_name,
            'status' => $this->partner->status,
        ];
    }
}