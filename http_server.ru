#!/usr/bin/env rackup

require "rack-livereload"

use Rack::ContentLength
use Rack::LiveReload

app = Rack::Directory.new Dir.pwd
run app
