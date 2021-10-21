<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Request;
use Symfony\Component\ErrorHandler\ErrorRenderer\HtmlErrorRenderer;
use Symfony\Component\ErrorHandler\Exception\FlattenException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function report(Throwable $exception)
    {
        if ($this->shouldReport($exception)) {
            $this->sendEmail($exception);
        }

        parent::report($exception);
    }

    public function sendEmail(Throwable $exception)
    {
        if (!is_a($exception, 'Exception')) {
            Log::error($exception);
            return;
        }

        try {
            $e = FlattenException::create($exception);
            $handler = new HtmlErrorRenderer(true);
            $css = $handler->getStylesheet();
            $content = $handler->getBody($e);

            Mail::send('emails.exception', compact('css', 'content'), function ($message) {
                $message->to(['pogasanov@gmail.com'])
                    ->subject('Exception: ' . Request::fullUrl());
            });
        } catch (Throwable $exception) {
            Log::error($exception);
        }
    }
}
